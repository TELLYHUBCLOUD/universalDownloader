const axios = require("axios");

const BASE_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  "accept-language": "en-US,en;q=0.9",
  accept: "application/json",
  referer: "https://www.pixiv.net/",
};

function parseArtworkId(input) {
  if (/^\d+$/.test(String(input).trim())) return String(input).trim();

  const match = String(input).match(
    /(?:artworks\/|illust_id=)(\d+)/,
  );
  if (match) return match[1];

  throw new Error("Invalid Pixiv URL or artwork id");
}

function buildHeaders(cookie) {
  const headers = { ...BASE_HEADERS };
  if (cookie) {
    headers.cookie = cookie.includes("=") ? cookie : `PHPSESSID=${cookie}`;
  }
  return headers;
}

async function fetchUgoiraMeta(id, cookie) {
  const { data } = await axios.get(
    `https://www.pixiv.net/ajax/illust/${id}/ugoira_meta?lang=en`,
    { headers: buildHeaders(cookie) },
  );

  if (data.error) throw new Error(data.message || "Failed to fetch ugoira meta");
  return data.body;
}

async function fetchPixivData(inputUrl, cookie) {
  const id = parseArtworkId(inputUrl);

  const { data } = await axios.get(
    `https://www.pixiv.net/ajax/illust/${id}?lang=en`,
    { headers: buildHeaders(cookie), validateStatus: () => true },
  );

  if (!data || data.error) {
    throw new Error(
      data?.message ||
        "Failed to fetch artwork. R-18 works need a PHPSESSID cookie.",
    );
  }

  const body = data.body;
  const { urls, pageCount, tags, illustType } = body;

  const tagList = (tags?.tags || []).map((tag) => ({
    name: tag.tag,
    translation: tag.translation?.en || null,
  }));

  const media = [];

  if (illustType === 2) {
    // Ugoira (animation) — expose the source zip of frames.
    const meta = await fetchUgoiraMeta(id, cookie);
    media.push({
      index: 1,
      type: "ugoira",
      frameCount: meta.frames?.length || 0,
      zip: meta.originalSrc,
      preview: meta.src,
      frames: meta.frames || [],
    });
  } else {
    if (!urls?.original) {
      throw new Error(
        "Original image is not available. R-18 works need a PHPSESSID cookie.",
      );
    }

    for (let i = 0; i < (pageCount || 1); i++) {
      const page = Object.fromEntries(
        Object.entries(urls).map(([key, value]) => [
          key,
          typeof value === "string" ? value.replace(/_p\d+/, `_p${i}`) : value,
        ]),
      );

      media.push({
        index: i + 1,
        type: "image",
        original: page.original,
        large: page.regular || null,
        small: page.small || null,
        thumbnail: page.thumb || page.mini || null,
      });
    }
  }

  return {
    platform: "pixiv",
    id,
    title: body.title,
    alt: body.alt,
    description: body.description,
    author: {
      id: body.userId,
      name: body.userName,
      account: body.userAccount || null,
    },
    createDate: body.createDate,
    likeCount: body.likeCount,
    bookmarkCount: body.bookmarkCount,
    viewCount: body.viewCount,
    commentCount: body.commentCount,
    isR18: Boolean(body.xRestrict),
    tags: tagList,
    mediaCount: media.length,
    media,
    note: "Pixiv image URLs require the header 'Referer: https://www.pixiv.net/' when downloading.",
  };
}

async function fetchPixivUserArtworks(input, cookie, type = "illusts") {
  const userId = /^\d+$/.test(String(input).trim())
    ? String(input).trim()
    : String(input).match(/\/users\/(\d+)/)?.[1];

  if (!userId) throw new Error("Invalid Pixiv user URL or id");

  const { data } = await axios.get(
    `https://www.pixiv.net/ajax/user/${userId}/profile/all?lang=en`,
    { headers: buildHeaders(cookie), validateStatus: () => true },
  );

  if (!data || data.error || !data.body) {
    throw new Error(data?.message || "Failed to fetch user profile");
  }

  const bucket = data.body[type] || {};
  const ids = Object.keys(bucket).sort((a, b) => Number(b) - Number(a));

  return {
    platform: "pixiv",
    userId,
    type,
    total: ids.length,
    artworkIds: ids,
  };
}

module.exports = { fetchPixivData, fetchPixivUserArtworks };
