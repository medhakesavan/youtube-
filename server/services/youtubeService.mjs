import { google } from 'googleapis';
import logger from '../log.mjs';

export const getYouTubeAuth = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI || `http://localhost:5000/auth/callback`
  );
};

export const getYouTubeClient = (credentials) => {
  const oauth2Client = getYouTubeAuth();

  if (credentials) {
    oauth2Client.setCredentials(credentials);
  }

  return google.youtube({ version: 'v3', auth: oauth2Client });
};

export const fetchLatestComments = async (youtube, channelId, maxResults = 50) => {
  try {
    const response = await youtube.commentThreads.list({
      part: 'snippet,replies',
      allThreadsRelatedToChannelId: channelId,
      maxResults,
      order: 'time',
      textFormat: 'plainText',
    });

    const items = response.data?.items || [];
    return items.map(item => {
      const comment = item.snippet?.topLevelComment;
      const snippet = comment?.snippet;
      
      return {
        youtubeId: comment?.id || item.id,
        videoId: item.snippet?.videoId || '',
        text: snippet?.textDisplay || '',
        author: snippet?.authorDisplayName || 'Anonymous',
        authorProfileImageUrl: snippet?.authorProfileImageUrl || '',
        publishedAt: snippet?.publishedAt || new Date().toISOString(),
      };
    });
  } catch (error) {
    logger.error('Error fetching YouTube comments:', error);
    return []; // Return empty array instead of throwing to prevent worker crash
  }
};

export const likeComment = async (youtube, commentId) => {
  try {
    await youtube.comments.setRating({
      id: commentId,
      rating: 'like',
    });
    logger.info(`Liked comment: ${commentId}`);
    return true;
  } catch (error) {
    logger.error(`Error liking comment ${commentId}:`, error);
    return false;
  }
};

export const deleteCommentFromYouTube = async (youtube, commentId) => {
  try {
    await youtube.comments.delete({
      id: commentId
    });
    logger.info(`Deleted comment from YouTube: ${commentId}`);
    return true;
  } catch (error) {
    // If comment is already gone, count as success
    if (error.code === 404) return true;
    logger.error(`Error deleting comment ${commentId}:`, error);
    return false;
  }
};
export const hideComment = async (youtube, commentId) => {
  try {
    await youtube.comments.setModerationStatus({
      id: commentId,
      moderationStatus: 'heldForReview',
    });
    logger.info(`Hid comment (held for review): ${commentId}`);
    return true;
  } catch (error) {
    logger.error(`Error hiding comment ${commentId}:`, error);
    return false;
  }
};

export const replyToComment = async (youtube, commentId, text) => {
  try {
    await youtube.comments.insert({
      part: 'snippet',
      resource: {
        snippet: {
          parentId: commentId,
          textOriginal: text,
        },
      },
    });
    logger.info(`Replied to comment ${commentId}: ${text}`);
    return true;
  } catch (error) {
    logger.error(`Error replying to comment ${commentId}:`, error);
    return false;
  }
};
