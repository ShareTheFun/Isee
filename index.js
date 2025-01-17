const express = require('express');
const { ytdown } = require('nayan-videos-downloader');
const path = require('path');

const app = express();
const port = 3000;

// Set up middleware
app.use(express.urlencoded({ extended: true })); // To parse form data

// Serve static files (like CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Route for homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle download request
app.post('/download', async (req, res) => {
  const videoURL = req.body.videoURL;
  try {
    const downloadData = await ytdown(videoURL);
    res.json(downloadData.data);
  } catch (error) {
    console.error("Error fetching download data:", error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
