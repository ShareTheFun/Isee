const express = require("express")
const path = require("path")
const { ytdown } = require("nayan-videos-downloader")
const fetch = require("node-fetch")

const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.post("/download", async (req, res) => {
  const videoURL = req.body.videoURL
  try {
    const downloadData = await ytdown(videoURL)

    // Ensure we have valid data
    if (!downloadData || !downloadData.data) {
      throw new Error("Failed to fetch video data")
    }

    // Send only the required data
    res.json({
      title: downloadData.data.title || "Untitled",
      video: downloadData.data.video || "",
      audio: downloadData.data.audio || "",
    })
  } catch (error) {
    console.error("Error fetching download data:", error)
    res.status(500).json({ error: "Failed to process video. Please try again." })
  }
})

// Enhanced proxy route for audio downloads
app.get("/proxy-audio", async (req, res) => {
  const audioUrl = req.query.url
  const mainTitle = req.query.title || "audio"

  if (!audioUrl) {
    return res.status(400).json({ error: "Missing audio URL" })
  }

  try {
    const response = await fetch(audioUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`)
    }

    // Get content type from response
    const contentType = response.headers.get("content-type")

    // Set appropriate headers
    res.setHeader("Content-Type", contentType || "audio/mpeg")
    res.setHeader("Content-Disposition", `attachment; filename="${mainTitle}.mp3"`)

    // Stream the response
    response.body.pipe(res)
  } catch (error) {
    console.error("Proxy audio error:", error)
    res.status(500).json({ error: "Failed to download audio. Please try again." })
  }
})

// Enhanced proxy route for video downloads
app.get("/proxy-video", async (req, res) => {
  const videoUrl = req.query.url
  const mainTitle = req.query.title || "video"

  if (!videoUrl) {
    return res.status(400).json({ error: "Missing video URL" })
  }

  try {
    const response = await fetch(videoUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`)
    }

    // Get content type from response
    const contentType = response.headers.get("content-type")

    // Set appropriate headers
    res.setHeader("Content-Type", contentType || "video/mp4")
    res.setHeader("Content-Disposition", `attachment; filename="${mainTitle}.mp4"`)

    // Stream the response
    response.body.pipe(res)
  } catch (error) {
    console.error("Proxy video error:", error)
    res.status(500).json({ error: "Failed to download video. Please try again." })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong! Please try again." })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

