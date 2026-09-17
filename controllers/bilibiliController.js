const { fetchBilibiliData } = require("../services/bilibiliService");

async function handleBilibiliDownload(req, res) {
  const { url, cookie } = req.query;
  if (!url) {
    return res
      .status(400)
      .json({ success: false, error: "Missing 'url' query parameter." });
  }

  try {
    const data = await fetchBilibiliData(url, { cookie });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { handleBilibiliDownload };
