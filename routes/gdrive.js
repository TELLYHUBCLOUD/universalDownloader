const express = require("express");
const router = express.Router();
const { handleGdriveDownload } = require("../controllers/gdriveController");

router.get("/download", handleGdriveDownload);

module.exports = router;
