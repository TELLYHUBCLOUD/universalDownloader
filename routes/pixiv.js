const express = require("express");
const router = express.Router();
const {
  handlePixivDownload,
  handlePixivUser,
} = require("../controllers/pixivController");

router.get("/download", handlePixivDownload);
router.get("/user", handlePixivUser);

module.exports = router;
