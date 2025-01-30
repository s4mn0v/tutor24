// server/utils/youtubeAPI.ts
import { google, youtube_v3 } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

interface VideoInfo {
  title: string;
  url: string;
}

export async function getYouTubeVideos(query: string): Promise<VideoInfo[]> {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults: 3,
    });

    return (response.data.items || []).map((item: youtube_v3.Schema$SearchResult) => ({
      title: item.snippet?.title || '',
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}