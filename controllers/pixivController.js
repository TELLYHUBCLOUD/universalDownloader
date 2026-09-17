const {
  fetchPixivData,
  fetchPixivUserArtworks,
} = require("../services/pixivService");

async function handlePixivDownload(req, res) {
  const { url, cookie } = req.query;
  if (!url) {
    return res
      .status(400)
      .json({ success: false, error: "Missing 'url' query parameter." });
  }

  try {
    const data = await fetchPixivData(url, cookie);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function handlePixivUser(req, res) {
  const { url, cookie, type } = req.query;
  if (!url) {
    return res
      .status(400)
      .json({ success: false, error: "Missing 'url' query parameter." });
  }

  try {
    const data = await fetchPixivUserArtworks(url, cookie, type || "illusts");
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { handlePixivDownload, handlePixivUser };
