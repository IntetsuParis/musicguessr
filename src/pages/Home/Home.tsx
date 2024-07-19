import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "../Home/Home.module.scss";
import { VideoItem } from "../../@types/videos.types";
import "react-h5-audio-player/lib/styles.css";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import VolumeDown from "@mui/icons-material/VolumeDown";
import VolumeUp from "@mui/icons-material/VolumeUp";
import ReactPlayer from "react-player";
import Button from "@mui/material/Button";
import { Bounce, toast, ToastContainer } from "react-toastify";

const GuessSong: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [guess, setGuess] = useState<string>("");
  const [volume, setVolume] = useState<number>(50);
  const [played, setPlayed] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const playerRef = useRef<ReactPlayer | null>(null);
  const API_KEY = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (currentVideo) {
      generateOptions();
    }
  }, [currentVideo]);

  const fetchVideos = async () => {
    try {
      const searchQuery = "Music";
      const maxResults = 100;
      const publishedAfter = "1990-01-01T00:00:00Z";
      const publishedBefore = "2023-12-31T23:59:59Z";
      const order = "viewCount";
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${searchQuery}&part=snippet&type=video&maxResults=${maxResults}&publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}&order=${order}`;
      const response = await axios.get(apiUrl);
      const shuffledVideos = shuffleArray(response.data.items);
      setVideos(shuffledVideos);
      setCurrentVideo(shuffledVideos[0]);
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

  const getFullTitle = (video: VideoItem) => {
    return video.snippet.title;
  };

  const shuffleArray = (array: VideoItem[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleGuess = (selectedTitle: string) => {
    if (!currentVideo) return;
    if (selectedTitle.toLowerCase() === correctAnswer?.toLowerCase()) {
      toast.success("🦄 Wow so easy!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } else {
      alert("Incorrect, try again!");
    }
    handleNextTrack();
  };

  const generateOptions = () => {
    if (!currentVideo) return;
    const correctTitle = getFullTitle(currentVideo);
    const shuffledVideos = [...videos].sort(() => 0.5 - Math.random());
    const otherTitles = shuffledVideos
      .filter((video) => video.id.videoId !== currentVideo.id.videoId)
      .slice(0, 3)
      .map((video) => getFullTitle(video));
    const allTitles = [correctTitle, ...otherTitles].sort(
      () => 0.5 - Math.random()
    );
    setOptions(allTitles);
    setCorrectAnswer(correctTitle);
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

  const handleProgress = (state: {
    playedSeconds: number;
    loadedSeconds: number;
  }) => {
    setPlayed(state.playedSeconds);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number" && playerRef.current) {
      playerRef.current.seekTo(newValue);
    }
  };
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
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
          controls={false}
          onProgress={handleProgress}
          onDuration={handleDuration}
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
      <div className={styles.progressControl}>
        <Slider
          aria-label="Playback Progress"
          value={played}
          min={0}
          max={duration}
          onChange={handleSeek}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) =>
            new Date(value * 1000).toISOString().substr(11, 8)
          }
        />
        <div className={styles.timeDisplay}>
          <span>{formatTime(played)}</span>
          <span>{formatTime(duration)}</span>
        </div>
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

      <div className={styles.input}>
        {options.map((option, index) => (
          <div key={index}>
            <Button
              className={styles.button}
              variant="contained"
              onClick={() => handleGuess(option)}
            >
              {option}
            </Button>
          </div>
        ))}
      </div>

      <ToastContainer />
    </div>
  );
};

export default GuessSong;
