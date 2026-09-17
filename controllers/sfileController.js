const { fetchSfileData } = require("../services/sfileService");

async function handleSfileDownload(req, res) {
  const { url } = req.query;
  if (!url) {
    return res
      .status(400)
      .json({ success: false, error: "Missing 'url' query parameter." });
  }

  try {
    const data = await fetchSfileData(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { handleSfileDownload };
