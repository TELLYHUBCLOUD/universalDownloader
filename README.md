# universalDownloader

[![GitHub stars](https://img.shields.io/github/stars/milancodess/universalDownloader?style=social)](https://github.com/milancodess/universalDownloader/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/milancodess/universalDownloader?style=social)](https://github.com/milancodess/universalDownloader/network/members)

[![Join our Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?logo=discord&logoColor=white)](https://discord.gg/qG9cCvEtA3)

A universal media downloader API built with Node.js and Express.
**One API, 25 platforms** — send a URL, get back clean JSON with direct media links.

No API keys, no sign-up, no third-party SDK: every downloader is scraped directly in this repo.

```
GET /api/meta/download?url=https://www.instagram.com/p/DLHQfPiyucu/
```

---

## Star History

<a href="https://www.star-history.com/?repos=milancodess%2FuniversalDownloader&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=milancodess/universalDownloader&type=date&theme=dark&legend=top-left&sealed_token=OjeWJJohuJbxfX1G52tMU7CDI9ZowhfKPlR2sZhfZBKOlyIQg7CA05qrvUvVxiCrUW4j1i1qqoZYkgrUxRJ2GoXecx_UQE1xmF_ZZy5UfF6fMRKP3N0vyg" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=milancodess/universalDownloader&type=date&legend=top-left&sealed_token=OjeWJJohuJbxfX1G52tMU7CDI9ZowhfKPlR2sZhfZBKOlyIQg7CA05qrvUvVxiCrUW4j1i1qqoZYkgrUxRJ2GoXecx_UQE1xmF_ZZy5UfF6fMRKP3N0vyg" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=milancodess/universalDownloader&type=date&legend=top-left&sealed_token=OjeWJJohuJbxfX1G52tMU7CDI9ZowhfKPlR2sZhfZBKOlyIQg7CA05qrvUvVxiCrUW4j1i1qqoZYkgrUxRJ2GoXecx_UQE1xmF_ZZy5UfF6fMRKP3N0vyg" />
 </picture>
</a>

---

## Supported Platforms

| Platform | Endpoint | Supported links |
| --- | --- | --- |
| Bilibili | `/api/bilibili` | `bilibili.tv/.../video/<id>` |
| Bluesky | `/api/bluesky` | `bsky.app/profile/.../post/...` |
| CapCut | `/api/capcut` | `capcut.com/t/...`, template links |
| Dailymotion | `/api/dailymotion` | `dailymotion.com/video/...`, `dai.ly/...` |
| Douyin | `/api/douyin` | `douyin.com/video/...`, `v.douyin.com/...` |
| Facebook & Instagram | `/api/meta` | posts, reels, stories, watch, `fb.watch` |
| Google Drive | `/api/gdrive` | `drive.google.com/file/d/...`, `uc?id=...` |
| Kuaishou | `/api/kuaishou` | `kuaishou.com/short-video/...` |
| LinkedIn | `/api/linkedin` | post / video permalinks |
| Mega | `/api/mega` | `mega.nz/file/<id>#<key>`, legacy `#!id!key` |
| Pinterest | `/api/pinterest` | `pinterest.com/pin/...`, `pin.it/...` |
| Pixiv | `/api/pixiv` | `pixiv.net/en/artworks/<id>` (illust, manga, ugoira) |
| Reddit | `/api/reddit` | post permalinks, `v.redd.it` |
| Sfile | `/api/sfile` | `sfile.mobi/...`, `sfile.co/...` |
| SnackVideo | `/api/snack` | `snackvideo.com/...`, `s.snackvideo.com/p/...` |
| Snapchat | `/api/snapchat` | spotlight & story links |
| SoundCloud | `/api/soundcloud` | track URLs |
| Spotify | `/api/spotify` | `open.spotify.com/track/...` |
| Terabox | `/api/terabox` | `terabox.com/s/...` and mirrors |
| Threads | `/api/threads` | `threads.net/@user/post/...` |
| TikTok | `/api/tiktok` | `tiktok.com/@user/video/...`, `vt/vm` short links |
| Tumblr | `/api/tumblr` | post permalinks |
| Twitter / X | `/api/twitter` | `twitter.com/...`, `x.com/...` |
| YouTube | `/api/youtube` | `youtube.com/watch?v=...`, `youtu.be/...`, Shorts |

Every platform exposes the same route shape: **`GET <endpoint>/download?url=<media url>`**
(Pixiv additionally has `GET /api/pixiv/user`).

---

## Installation

```bash
git clone https://github.com/milancodess/universalDownloader.git
cd universalDownloader
npm install
```

Requires **Node.js 18+**.

---

## Usage

Start the server:

```bash
npm start      # production
npm run dev    # watch mode (nodemon)
```

The API listens on `http://localhost:3000` (override with the `PORT` env variable).
`GET /` returns the list of every mounted endpoint.

### Example request

```bash
curl "http://localhost:3000/api/meta/download?url=https://www.instagram.com/p/DLHQfPiyucu/"
```

### Response shape

Every endpoint answers with the same envelope:

```json
{
  "success": true,
  "data": { }
}
```

```json
{
  "success": false,
  "error": "Missing 'url' query parameter."
}
```

| Status | Meaning |
| --- | --- |
| `200` | Media found, `data` is populated |
| `400` | `url` query parameter missing |
| `404` | Unknown endpoint |
| `500` | Upstream site failed, link is private/expired, or no media was found |

---

## API Endpoints

| Endpoint                    | Description                       | Method |
| --------------------------- | --------------------------------- | ------ |
| `/api/bilibili/download`    | Download Bilibili media           | GET    |
| `/api/bluesky/download`     | Download Bluesky media            | GET    |
| `/api/capcut/download`      | Download CapCut media             | GET    |
| `/api/dailymotion/download` | Download Dailymotion media        | GET    |
| `/api/douyin/download`      | Download Douyin media             | GET    |
| `/api/gdrive/download`      | Download Google Drive file        | GET    |
| `/api/kuaishou/download`    | Download Kuaishou media           | GET    |
| `/api/linkedin/download`    | Download LinkedIn media           | GET    |
| `/api/mega/download`        | Download Mega file                | GET    |
| `/api/meta/download`        | Download Facebook/Instagram media | GET    |
| `/api/pinterest/download`   | Download Pinterest media          | GET    |
| `/api/pixiv/download`       | Download Pixiv artwork / ugoira   | GET    |
| `/api/pixiv/user`           | List a Pixiv user's artwork ids   | GET    |
| `/api/reddit/download`      | Download Reddit media             | GET    |
| `/api/sfile/download`       | Download Sfile file               | GET    |
| `/api/snack/download`       | Download SnackVideo media         | GET    |
| `/api/snapchat/download`    | Download Snapchat media           | GET    |
| `/api/soundcloud/download`  | Download Soundcloud media         | GET    |
| `/api/spotify/download`     | Download Spotify media            | GET    |
| `/api/terabox/download`     | Download Terabox media            | GET    |
| `/api/threads/download`     | Download Threads media            | GET    |
| `/api/tiktok/download`      | Download TikTok media             | GET    |
| `/api/tumblr/download`      | Download Tumblr media             | GET    |
| `/api/twitter/download`     | Download Twitter media            | GET    |
| `/api/youtube/download`     | Download YouTube media            | GET    |

**~~See the full interactive API docs with Swagger at `/api-docs`.~~**

### Optional query parameters

| Endpoint                 | Param    | Description                                                      |
| ------------------------ | -------- | ---------------------------------------------------------------- |
| `/api/pixiv/download`    | `cookie` | Pixiv `PHPSESSID` — required only for R-18 artworks              |
| `/api/pixiv/user`        | `cookie` | Pixiv `PHPSESSID` (login needed for the profile listing)         |
| `/api/pixiv/user`        | `type`   | `illusts` (default), `manga` or `novels`                         |
| `/api/bilibili/download` | `cookie` | Bilibili `SESSDATA` — unlocks higher qualities / premium content |

---

## Examples

<details>
<summary><b>Google Drive</b> — <code>/api/gdrive/download</code></summary>

```bash
curl "http://localhost:3000/api/gdrive/download?url=https://drive.google.com/file/d/FILE_ID/view"
```

```json
{
  "success": true,
  "data": {
    "platform": "gdrive",
    "id": "FILE_ID",
    "filename": "movie.mp4",
    "filesize": "1.00 MB",
    "mimetype": "video/mp4",
    "downloadUrl": "https://drive.usercontent.google.com/download?id=FILE_ID&export=download"
  }
}
```

Large files that normally show the *"Google Drive can't scan this file for viruses"*
interstitial are handled automatically — the confirm token is solved and the final
direct link is returned.

</details>

<details>
<summary><b>Mega</b> — <code>/api/mega/download</code></summary>

```bash
curl "http://localhost:3000/api/mega/download?url=https://mega.nz/file/ID#KEY"
```

```json
{
  "success": true,
  "data": {
    "platform": "mega",
    "id": "ID",
    "filename": "archive.zip",
    "filesize": "11.77 MB",
    "filesizeBytes": 12345678,
    "downloadUrl": "https://gfs...mega.nz/dl/...",
    "key": "KEY"
  }
}
```

The filename is decrypted locally from the link's key. Note that Mega serves the file
**AES-CTR encrypted** — decrypt the bytes with the returned `key` before saving.

> Remember to URL-encode the `#` as `%23` when passing the link as a query parameter.

</details>

<details>
<summary><b>Pixiv</b> — <code>/api/pixiv/download</code> &amp; <code>/api/pixiv/user</code></summary>

```bash
curl "http://localhost:3000/api/pixiv/download?url=https://www.pixiv.net/en/artworks/12345678"
```

```json
{
  "success": true,
  "data": {
    "platform": "pixiv",
    "id": "12345678",
    "title": "Art",
    "author": { "id": "123", "name": "artist" },
    "likeCount": 10,
    "bookmarkCount": 20,
    "viewCount": 300,
    "isR18": false,
    "tags": [{ "name": "original", "translation": "original" }],
    "mediaCount": 2,
    "media": [
      {
        "index": 1,
        "type": "image",
        "original": "https://i.pximg.net/img-original/.../12345678_p0.png",
        "large": "https://i.pximg.net/img-master/.../12345678_p0.jpg"
      }
    ]
  }
}
```

Animated works (**ugoira**) return `type: "ugoira"` with the frames `zip` and per-frame
delays so you can build a GIF/MP4 yourself.

List every artwork id of a user:

```bash
curl "http://localhost:3000/api/pixiv/user?url=https://www.pixiv.net/en/users/123456&cookie=PHPSESSID_VALUE"
```

</details>

<details>
<summary><b>Bilibili</b> — <code>/api/bilibili/download</code></summary>

```bash
curl "http://localhost:3000/api/bilibili/download?url=https://www.bilibili.tv/en/video/4793260574800896"
```

```json
{
  "success": true,
  "data": {
    "platform": "bilibili",
    "aid": "4793260574800896",
    "title": "Anime EP1",
    "cover": "https://.../cover.jpg",
    "videos": [
      { "quality": "720P", "qualityId": 64, "codecs": "avc1", "size": "10.00 MB", "url": "https://..." }
    ],
    "audios": [{ "size": "1.00 MB", "mimeType": "audio/mp4", "url": "https://..." }]
  }
}
```

Bilibili uses DASH, so video and audio come as **separate tracks** — merge them with ffmpeg:

```bash
ffmpeg -i video.m4s -i audio.m4s -c:v copy -c:a aac output.mp4
```

</details>

<details>
<summary><b>Sfile</b> — <code>/api/sfile/download</code></summary>

```bash
curl "http://localhost:3000/api/sfile/download?url=https://sfile.mobi/abc123"
```

```json
{
  "success": true,
  "data": {
    "platform": "sfile",
    "filename": "app.apk",
    "filesize": "5.20 MB",
    "mimetype": "application/vnd.android.package-archive",
    "downloadUrl": "https://sfile.mobi/download/...&k=KEY",
    "cookie": "sid=abc"
  }
}
```

The two-step token flow is solved for you; just replay the returned `cookie` and the
original page as `Referer` when fetching `downloadUrl`.

</details>

<details>
<summary><b>SnackVideo</b> — <code>/api/snack/download</code></summary>

```bash
curl "http://localhost:3000/api/snack/download?url=https://s.snackvideo.com/p/xxxxxxxx"
```

```json
{
  "success": true,
  "data": {
    "platform": "snackvideo",
    "title": "Test clip",
    "author": "@tester",
    "thumbnail": "https://.../cover.jpg",
    "uploadDate": "2026-01-01",
    "likeCount": 99,
    "commentCount": 5,
    "video": { "url": "https://.../video.mp4", "format": "mp4" }
  }
}
```

</details>

---

## Downloading the media

Endpoints return **direct links + metadata** instead of streaming the bytes through this
server, which keeps it fast and serverless-friendly. Some hosts protect those links, so
send the right headers when you fetch them:

| Platform | Required headers |
| --- | --- |
| Pixiv | `Referer: https://www.pixiv.net/` |
| Bilibili | `Referer: https://www.bilibili.tv` |
| Sfile | `Referer: <original page url>` + the returned `cookie` |
| Mega | none, but the payload is AES-CTR encrypted (decrypt with `key`) |

```bash
curl -H "Referer: https://www.pixiv.net/" -o art.png "https://i.pximg.net/..."
```

---

## Deployment

The repo ships with a `vercel.json`, so it deploys to Vercel as-is:

```bash
vercel --prod
```

It also runs anywhere Node.js does (Railway, Render, Fly.io, a VPS, Docker):

```bash
PORT=8080 npm start
```

---

## Project Structure

```
.
├── controllers/       # Request handlers — validate input, shape the JSON response
├── routes/            # Express route definitions (one file per platform)
├── services/          # Scraping / business logic for each platform
├── index.js           # Express app entry point, mounts every route
├── vercel.json        # Serverless deployment config
└── package.json
```

### Adding a new platform

1. `services/<name>Service.js` — export an `async` function that takes the URL and
   returns a plain object (throw an `Error` when something goes wrong).
2. `controllers/<name>Controller.js` — validate `req.query.url`, call the service, reply
   with `{ success, data }`.
3. `routes/<name>.js` — `router.get("/download", handler)`.
4. Mount it in `index.js` and add it to the `endpoints` array + the tables above.

---

## Disclaimer

This project is for educational and personal use. It does not host or store any media —
it only resolves publicly reachable links. Respect each platform's Terms of Service and
the copyright of the original creators.

---

## Contributing

Feel free to open issues or submit pull requests!
If you want to add support for other platforms or improve error handling, you're welcome!

---

## Author

Milan Bhandari — [GitHub](https://github.com/milancodess)
