const express = require("express");
const stream = require("youtube-audio-stream");

const app = express();
const port = 3001;

app.get("/audio", (req, res) => {
  const videoUrl = req.query.url;

  try {
    stream(videoUrl).pipe(res);
  } catch (exception) {
    res.status(500).send(exception);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
