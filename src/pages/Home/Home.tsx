import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

import styles from "../Home/Home.module.scss";
import { VideoItem } from "../../@types/videos.types";
import "react-h5-audio-player/lib/styles.css";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import VolumeDown from "@mui/icons-material/VolumeDown";
import VolumeUp from "@mui/icons-material/VolumeUp";
import ReactPlayer from "react-player";

const GuessSong: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [guess, setGuess] = useState<string>("");
  const [volume, setVolume] = useState<number>(50); // начальный уровень громкости 50%
  const playerRef = useRef<ReactPlayer | null>(null);
  const API_KEY = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    if (API_KEY) {
      fetchVideos();
    } else {
      console.error("API Key is missing.");
    }
  }, []);

  const fetchVideos = async () => {
    try {
      const searchQuery = "Music";
      const maxResults = 100;
      const publishedAfter = "1990-01-01T00:00:00Z";
      const publishedBefore = "2023-12-31T23:59:59Z";
      const order = "viewCount"; // Сортировка по популярности
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${searchQuery}&part=snippet&type=video&maxResults=${maxResults}&publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}&order=${order}`;
      const response = await axios.get(apiUrl);
      setVideos(response.data.items);
      setCurrentVideo(response.data.items[0]); // установка первого видео
    } catch (error) {
      console.error("Error fetching videos: ", error);
    }
  };

  const handleNextTrack = () => {
    if (!currentVideo) return;
    const currentIndex = videos.findIndex(
      (video) => video.id.videoId === currentVideo.id.videoId
    );
    const nextIndex = (currentIndex + 1) % videos.length;
    setCurrentVideo(videos[nextIndex]);
    setGuess("");
  };

  const handleGuess = () => {
    if (!currentVideo) return;
    if (guess.toLowerCase() === currentVideo.snippet.title.toLowerCase()) {
      alert("Correct!");
    } else {
      alert("Incorrect, try again!");
    }
    handleNextTrack();
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setVolume(newValue);
      if (playerRef.current) {
        const player = playerRef.current.getInternalPlayer();
        if (player && typeof player.setVolume === "function") {
          player.setVolume(newValue);
        }
      }
    }
  };

  if (!currentVideo) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Guess the Song</h1>
      <div style={{ display: "none" }}>
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${currentVideo.id.videoId}`}
          controls={false} // не показывать элементы управления
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                showinfo: 0,
                rel: 0,
              },
            },
          }}
        />
      </div>

      <div className={styles.buttons}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => playerRef.current?.getInternalPlayer().playVideo()}
          startIcon={<PlayCircleFilledIcon />}
          className={styles.button}
        >
          Play
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => playerRef.current?.getInternalPlayer().pauseVideo()}
          startIcon={<PauseCircleFilledIcon />}
          className={styles.button}
        >
          Pause
        </Button>
      </div>
      <div className={styles.volumeControl}>
        <Box sx={{ width: 200 }}>
          <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
            <VolumeDown />
            <Slider
              aria-label="Volume"
              value={volume}
              onChange={handleVolumeChange}
            />
            <VolumeUp />
          </Stack>
        </Box>
      </div>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
      />
    </div>
  );
};

export default GuessSong;
