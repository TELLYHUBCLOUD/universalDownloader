const axios = require("axios");
const cheerio = require("cheerio");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47";

function baseHeaders(referer) {
  return {
    "user-agent": UA,
    referer,
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
  };
}

function collectCookies(response) {
  return (response.headers["set-cookie"] || [])
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

async function fetchSfileData(inputUrl) {
  if (!/sfile\.(mobi|co)/i.test(inputUrl)) {
    throw new Error("Invalid Sfile URL");
  }

  const headers = baseHeaders(inputUrl);

  const response = await axios.get(inputUrl, { headers });
  const cookie = collectCookies(response);
  if (cookie) headers.cookie = cookie;

  const html = response.data;
  const $ = cheerio.load(html);

  const filename =
    $("h1.intro").first().text().trim() ||
    $("title").text().replace(/^Download\s+/i, "").trim() ||
    null;

  const listText = $("div.list").first().text().trim();
  const mimetype = listText.split(" - ").pop()?.trim() || null;
  const uploader = $('div.list a[href*="/user/"]').first().text().trim() || null;
  const filesize =
    html.match(/Download File \(([^)]+)\)/)?.[1] ||
    listText.match(/\(([^)]+)\)/)?.[1] ||
    null;

  const dwUrl = html.match(/data-dw-url="([^"]+)"/)?.[1];
  const firstStep = $("a#download").attr("href");

  if (dwUrl) {
    return {
      platform: "sfile",
      filename,
      filesize,
      mimetype,
      uploader,
      downloadUrl: dwUrl,
      cookie: cookie || null,
      note: "Send 'Referer: <original url>' (and the cookie above when present) while downloading.",
    };
  }

  if (!firstStep) throw new Error("Download link not found");

  const second = await axios.get(firstStep, {
    headers: { ...headers, referer: inputUrl },
  });

  const secondCookie = collectCookies(second) || cookie;
  const html2 = second.data;
  const $2 = cheerio.load(html2);

  const finalUrl = $2("a#download").attr("href");
  if (!finalUrl) throw new Error("Final download link not found");

  const key = html2.match(/&k='\+(.*?)';/)?.[1]?.replace(/'/g, "");
  const downloadUrl = key ? `${finalUrl}&k=${key}` : finalUrl;

  return {
    platform: "sfile",
    filename,
    filesize: html2.match(/Download File \(([^)]+)\)/)?.[1] || filesize,
    mimetype,
    uploader,
    downloadUrl,
    cookie: secondCookie || null,
    note: "Send 'Referer: <original url>' (and the cookie above when present) while downloading.",
  };
}

module.exports = { fetchSfileData };
