const express = require("express");
const path = require("path");
const { ytdown } = require("nayan-videos-downloader");
const fetch = require("node-fetch"); // Using node-fetch version 2.x for CommonJS

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/download", async function (req, res) {
  const videoURL = req.body.videoURL;
  try {
    const downloadData = await ytdown(videoURL);
    res.json(downloadData.data);
  } catch (error) {
    console.error("Error fetching download data:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Proxy route for audio downloads
// Query parameters: url (original audio URL) and title (main title)
app.get("/proxy-audio", async function (req, res) {
  const audioUrl = req.query.url;
  const mainTitle = req.query.title || "audio";
  if (!audioUrl) {
    return res.status(400).send("Missing audio url");
  }
  try {
    const response = await fetch(audioUrl);
    if (!response.ok) {
      return res.status(500).send("Error fetching audio from source");
    }
    const data = await response.buffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="${mainTitle}.mp3"`);
    res.send(data);
  } catch (error) {
    console.error("Proxy audio error:", error);
    res.status(500).send("Error fetching audio");
  }
});

// Proxy route for video downloads
// Query parameters: url (original video URL) and title (main title)
app.get("/proxy-video", async function (req, res) {
  const videoUrl = req.query.url;
  const mainTitle = req.query.title || "video";
  if (!videoUrl) {
    return res.status(400).send("Missing video url");
  }
  try {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      return res.status(500).send("Error fetching video from source");
    }
    const data = await response.buffer();
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${mainTitle}.mp4"`);
    res.send(data);
  } catch (error) {
    console.error("Proxy video error:", error);
    res.status(500).send("Error fetching video");
  }
});

app.listen(port, function () {
  console.log("Server running at http://localhost:" + port);
});
