const axios = require("axios");
const cheerio = require("cheerio");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

function parseAid(url) {
  const match = String(url).match(/\/video\/(?:av)?(\d+)/i);
  return match ? match[1] : null;
}

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!size || Number.isNaN(size)) return null;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

async function fetchBilibiliData(inputUrl, { cookie = "" } = {}) {
  const aid = parseAid(inputUrl);
  if (!aid) throw new Error("Invalid Bilibili URL (expected /video/<id>)");

  const { data: html } = await axios.get(inputUrl, {
    headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
    maxRedirects: 5,
  });

  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content")?.split("|")[0]?.trim() ||
    null;
  const description = $('meta[property="og:description"]').attr("content") || null;
  const cover = $('meta[property="og:image"]').attr("content") || null;
  const locale = $('meta[property="og:locale"]').attr("content") || null;

  const cookieHeader = cookie
    ? cookie.startsWith("SESSDATA=")
      ? cookie
      : `SESSDATA=${cookie}`
    : "";

  const { data: playurl } = await axios.get(
    "https://api.bilibili.tv/intl/gateway/web/playurl",
    {
      headers: {
        "user-agent": UA,
        referer: inputUrl,
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      params: {
        s_locale: "en_US",
        platform: "web",
        aid,
        qn: "64",
        type: "0",
        device: "wap",
        tf: "0",
        spm_id: "bstar-web.ugc-video-detail.0.0",
        from_spm_id: "bstar-web.homepage.trending.all",
        fnval: "16",
        fnver: "0",
      },
    },
  );

  const play = playurl?.data?.playurl;
  if (!play) {
    throw new Error(playurl?.message || "No playable stream found");
  }

  const videos = (play.video || []).map((item) => ({
    quality: item.stream_info?.desc_words || null,
    qualityId: item.video_resource?.quality ?? null,
    codecs: item.video_resource?.codecs || null,
    size: formatFileSize(item.video_resource?.size),
    mimeType: item.video_resource?.mime_type || null,
    url: item.video_resource?.url || item.video_resource?.backup_url?.[0] || null,
  })).filter((item) => item.url);

  const audios = (play.audio_resource || []).map((item) => ({
    size: formatFileSize(item.size),
    mimeType: item.mime_type || null,
    url: item.url || item.backup_url?.[0] || null,
  })).filter((item) => item.url);

  if (!videos.length && !audios.length) {
    throw new Error("No media found (video may be region locked or premium)");
  }

  return {
    platform: "bilibili",
    aid,
    title,
    description,
    locale,
    cover,
    videoCount: videos.length,
    audioCount: audios.length,
    videos,
    audios,
    note: "Video and audio streams are separate (DASH); merge them with ffmpeg. Requests need 'Referer: https://www.bilibili.tv'.",
  };
}

module.exports = { fetchBilibiliData };
