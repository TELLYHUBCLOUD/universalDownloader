const axios = require("axios");
const CryptoJS = require("crypto-js");

const MEGA_API = "https://g.api.mega.co.nz/cs";

const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  origin: "https://mega.nz",
  referer: "https://mega.nz/",
  "content-type": "application/json",
};

const ERROR_CODES = {
  "-1": "An internal error occurred on Mega",
  "-2": "Invalid request arguments",
  "-3": "Request failed, please retry",
  "-6": "Too many concurrent connections",
  "-9": "File not found or access denied",
  "-11": "Access violation",
  "-16": "User blocked",
  "-17": "Request over quota",
  "-18": "Resource temporarily unavailable",
};

function base64ToBytes(base64) {
  const normalized = String(base64).replace(/-/g, "+").replace(/_/g, "/");
  return new Uint8Array(Buffer.from(normalized, "base64"));
}

function deriveKey(fileKey) {
  const bytes = base64ToBytes(fileKey);
  if (bytes.length !== 32) {
    throw new Error(
      `Invalid decryption key length: expected 32 bytes, got ${bytes.length}`,
    );
  }

  const k = new Uint32Array(bytes.buffer);
  const derived = new Uint32Array([
    k[0] ^ k[4],
    k[1] ^ k[5],
    k[2] ^ k[6],
    k[3] ^ k[7],
  ]);

  return new Uint8Array(derived.buffer);
}

function decryptAttributes(encoded, fileKey) {
  try {
    const key = deriveKey(fileKey);
    const cipher = base64ToBytes(encoded);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.lib.WordArray.create(cipher) },
      CryptoJS.lib.WordArray.create(key),
      {
        iv: CryptoJS.lib.WordArray.create(new Uint8Array(16)),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.NoPadding,
      },
    );

    const text = CryptoJS.enc.Utf8.stringify(decrypted)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim();

    if (!text.startsWith("MEGA")) return null;
    return JSON.parse(text.substring(4));
  } catch {
    return null;
  }
}

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!size || Number.isNaN(size)) return null;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function parseMegaUrl(inputUrl) {
  const decoded = decodeURIComponent(String(inputUrl));

  // Supports /file/<id>#<key> and legacy /#!<id>!<key>
  const modern = decoded.match(/file\/([a-zA-Z0-9_-]+)(?:#([^\s]+))?/);
  if (modern) {
    return { fileId: modern[1], fileKey: modern[2] || decoded.split("#")[1] };
  }

  const legacy = decoded.match(/#!([a-zA-Z0-9_-]+)!([a-zA-Z0-9_-]+)/);
  if (legacy) return { fileId: legacy[1], fileKey: legacy[2] };

  return { fileId: null, fileKey: null };
}

async function fetchMegaData(inputUrl, { timeout = 15000 } = {}) {
  const { fileId, fileKey } = parseMegaUrl(inputUrl);

  if (!fileId) throw new Error("Invalid Mega URL: file id not found");
  if (!fileKey) {
    throw new Error("Invalid Mega URL: missing decryption key (part after #)");
  }

  let lastError;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data } = await axios.post(
        MEGA_API,
        [{ a: "g", g: 1, p: fileId }],
        { headers: HEADERS, timeout },
      );

      if (typeof data === "number") {
        throw new Error(ERROR_CODES[String(data)] || `Mega error ${data}`);
      }

      if (!Array.isArray(data) || !data.length) {
        throw new Error("Invalid or empty response from Mega API");
      }

      const info = data[0];

      if (typeof info === "number") {
        throw new Error(ERROR_CODES[String(info)] || `Mega error ${info}`);
      }

      if (typeof info?.s !== "number" || typeof info?.g !== "string") {
        throw new Error("Mega response missing file size or download link");
      }

      const attrs = info.at ? decryptAttributes(info.at, fileKey) : null;

      return {
        platform: "mega",
        id: fileId,
        filename: attrs?.n || "[encrypted filename]",
        filesize: formatFileSize(info.s),
        filesizeBytes: info.s,
        downloadUrl: info.g,
        note:
          "The download link serves AES-CTR encrypted bytes; decrypt them with the key from the URL fragment.",
        key: fileKey,
      };
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }

  throw new Error(lastError?.message || "Mega request failed");
}

module.exports = { fetchMegaData };
