const express = require("express");
const router = express.Router();
const { handleSfileDownload } = require("../controllers/sfileController");

router.get("/download", handleSfileDownload);

module.exports = router;
