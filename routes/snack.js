const express = require("express");
const router = express.Router();
const { handleSnackDownload } = require("../controllers/snackController");

router.get("/download", handleSnackDownload);

module.exports = router;
