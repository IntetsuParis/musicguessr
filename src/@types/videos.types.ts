export interface VideoId {
  videoId: string;
}

export interface VideoSnippet {
  title: string;
  description: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
}

export interface VideoItem {
  id: VideoId;
  snippet: VideoSnippet;
}
