const { fetchSnackVideo } = require("../services/snackService");

async function handleSnackDownload(req, res) {
  const { url } = req.query;
  if (!url) {
    return res
      .status(400)
      .json({ success: false, error: "Missing 'url' query parameter." });
  }

  try {
    const data = await fetchSnackVideo(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { handleSnackDownload };
