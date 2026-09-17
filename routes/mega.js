const express = require("express");
const router = express.Router();
const { handleMegaDownload } = require("../controllers/megaController");

router.get("/download", handleMegaDownload);

module.exports = router;
