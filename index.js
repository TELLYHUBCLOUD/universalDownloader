const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.set("json spaces", 2);
app.use(morgan("dev"));

app.use("/api/bilibili", require("./routes/bilibili"));
app.use("/api/bluesky", require("./routes/bluesky"));
app.use("/api/capcut", require("./routes/capcut"));
app.use("/api/dailymotion", require("./routes/dailymotion"));
app.use("/api/douyin", require("./routes/douyin"));
app.use("/api/gdrive", require("./routes/gdrive"));
app.use("/api/kuaishou", require("./routes/kuaishou"));
app.use("/api/linkedin", require("./routes/linkedin"));
app.use("/api/mega", require("./routes/mega"));
app.use("/api/meta", require("./routes/facebookInsta"));
app.use("/api/pinterest", require("./routes/pinterest"));
app.use("/api/pixiv", require("./routes/pixiv"));
app.use("/api/reddit", require("./routes/reddit"));
app.use("/api/sfile", require("./routes/sfile"));
app.use("/api/snack", require("./routes/snack"));
app.use("/api/snapchat", require("./routes/snapchat"));
app.use("/api/soundcloud", require("./routes/soundcloud"));
app.use("/api/spotify", require("./routes/spotify"));
app.use("/api/terabox", require("./routes/terabox"));
app.use("/api/threads", require("./routes/threads"));
app.use("/api/tiktok", require("./routes/tiktok"));
app.use("/api/tumblr", require("./routes/tumblr"));
app.use("/api/twitter", require("./routes/twitter"));
app.use("/api/youtube", require("./routes/youtube"));

const endpoints = [
  "/api/bilibili",
  "/api/bluesky",
  "/api/capcut",
  "/api/dailymotion",
  "/api/douyin",
  "/api/gdrive",
  "/api/kuaishou",
  "/api/linkedin",
  "/api/mega",
  "/api/meta",
  "/api/pinterest",
  "/api/pixiv",
  "/api/pixiv/user",
  "/api/reddit",
  "/api/sfile",
  "/api/snack",
  "/api/snapchat",
  "/api/soundcloud",
  "/api/spotify",
  "/api/terabox",
  "/api/threads",
  "/api/tiktok",
  "/api/tumblr",
  "/api/twitter",
  "/api/youtube",
];

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    author: "Milan Bhandari",
    contact: "https://www.milanb.com.np/",
    message: "Universal Downloader API is running",
    endpoints,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
