const axios = require("axios");
const cheerio = require("cheerio");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

async function fetchSnackVideo(inputUrl) {
  const { data: html } = await axios.get(inputUrl, {
    headers: {
      "user-agent": UA,
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
    maxRedirects: 5,
  });

  const $ = cheerio.load(html);

  let videoData = null;
  const inline = $("#VideoObject").html();

  if (inline) {
    videoData = JSON.parse(inline);
  } else {
    // Fallback: any ld+json block describing a VideoObject
    $('script[type="application/ld+json"]').each((_, el) => {
      if (videoData) return;
      try {
        const parsed = JSON.parse($(el).html());
        const node = Array.isArray(parsed) ? parsed[0] : parsed;
        if (node && node["@type"] === "VideoObject") videoData = node;
      } catch {
        /* ignore malformed ld+json */
      }
    });
  }

  if (!videoData) throw new Error("Video data not found on the page");

  const videoUrl =
    videoData.contentUrl ||
    $('meta[property="og:video"]').attr("content") ||
    $('meta[property="og:video:url"]').attr("content");

  if (!videoUrl) throw new Error("No downloadable video found");

  return {
    platform: "snackvideo",
    title: videoData.name || null,
    author:
      videoData.creator?.mainEntity?.name || videoData.creator?.name || null,
    description: videoData.description || null,
    transcript: videoData.transcript || null,
    thumbnail: videoData.thumbnailUrl || null,
    uploadDate: videoData.uploadDate || null,
    duration: videoData.duration || null,
    likeCount: videoData.interactionStatistic?.userInteractionCount ?? null,
    commentCount: videoData.commentCount ?? null,
    audio: videoData.audio || null,
    video: {
      url: videoUrl,
      format: "mp4",
    },
  };
}

module.exports = { fetchSnackVideo };
