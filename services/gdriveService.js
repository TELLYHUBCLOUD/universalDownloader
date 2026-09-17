const axios = require("axios");
const cheerio = require("cheerio");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

function extractFileId(url) {
  const match = String(url).match(
    /(?:https?:\/\/drive\.google\.com\/(?:file\/d\/|uc\?id=|open\?id=))?(?<id>[-\w]{25,})/,
  );
  return match?.groups?.id || null;
}

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!size || Number.isNaN(size)) return null;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function parseFilenameFromHeader(header) {
  if (!header) return null;
  const utf8 = /filename\*=UTF-8''([^;\n]*)/i.exec(header);
  if (utf8) return decodeURIComponent(utf8[1]);
  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(header);
  return match?.[1]?.replace(/['"]/g, "").trim() || null;
}

async function fetchGdriveData(inputUrl) {
  const id = extractFileId(inputUrl);
  if (!id) throw new Error("Invalid Google Drive URL");

  const baseUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download`;

  const response = await axios.get(baseUrl, {
    responseType: "stream",
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
    headers: { "user-agent": UA },
  });

  const contentType = response.headers["content-type"] || "";
  const disposition = response.headers["content-disposition"];

  // Small files: Google serves the binary straight away.
  if (disposition) {
    response.data.destroy();
    return {
      platform: "gdrive",
      id,
      filename: parseFilenameFromHeader(disposition),
      filesize: formatFileSize(response.headers["content-length"]),
      mimetype: contentType || null,
      downloadUrl: baseUrl,
    };
  }

  // Big files / virus-scan warning: an HTML confirm form is returned instead.
  response.data.destroy();

  const { data: html } = await axios.get(baseUrl, {
    headers: { "user-agent": UA },
  });

  const $ = cheerio.load(html);
  const params = new URLSearchParams();

  $('form input[type="hidden"]').each((_, el) => {
    const name = $(el).attr("name");
    const value = $(el).attr("value");
    if (name) params.append(name, value ?? "");
  });

  if (![...params.keys()].length) {
    throw new Error("File not found, private, or download quota exceeded");
  }

  const nameSize = $("span.uc-name-size").first();
  const filename = nameSize.find("a").text().trim() || null;
  const filesize =
    nameSize.text().match(/\(([^)]+)\)/)?.[1]?.trim() || null;

  const action =
    $("form").attr("action") || "https://drive.usercontent.google.com/download";

  const downloadUrl = `${action}?${params.toString()}`;

  const head = await axios
    .get(downloadUrl, {
      responseType: "stream",
      maxRedirects: 5,
      headers: { "user-agent": UA },
      validateStatus: (status) => status >= 200 && status < 400,
    })
    .then((res) => {
      res.data.destroy();
      return res.headers;
    })
    .catch(() => ({}));

  return {
    platform: "gdrive",
    id,
    filename: parseFilenameFromHeader(head["content-disposition"]) || filename,
    filesize: formatFileSize(head["content-length"]) || filesize,
    mimetype: head["content-type"] || null,
    downloadUrl,
  };
}

module.exports = { fetchGdriveData };
