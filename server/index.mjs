import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './log.mjs';
import { getYouTubeClient, getYouTubeAuth, fetchLatestComments, likeComment } from './services/youtubeService.mjs';
import { classifyComment } from './services/aiService.mjs';
import Comment from './models/Comment.mjs';
import Channel from './models/Channel.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yt-moderator';
logger.info(`Attempting to connect to MongoDB: ${MONGODB_URI.split('@').pop()}`);

mongoose.connect(MONGODB_URI)
  .then(() => logger.info('MongoDB Connected'))
  .catch(err => logger.error('MongoDB Connection Error:', err));

// YouTube OAuth Setup Check
if (!process.env.GOOGLE_CLIENT_ID) {
  logger.error('CRITICAL ERROR: GOOGLE_CLIENT_ID is missing from .env file!');
} else {
  logger.info(`Google Client ID detected: ${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...`);
}

const oauth2Client = getYouTubeAuth();

// Routes
app.get('/', (req, res) => res.send('AI YouTube Moderator API is running.'));

app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/youtube.force-ssl'],
  });
  res.redirect(authUrl);
});

app.get('/oauth', (req, res) => res.redirect('/auth'));

app.get('/auth/callback', async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);

    const youtube = getYouTubeClient(tokens);
    const channelRes = await youtube.channels.list({ part: 'snippet', mine: true });
    const channelData = channelRes.data.items[0];

    await Channel.findOneAndUpdate(
      { channelId: channelData.id },
      {
        channelId: channelData.id,
        title: channelData.snippet.title,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      },
      { upsert: true }
    );

    res.send('Authentication successful! You can close this tab.');
    processComments(channelData.id, tokens);
  } catch (error) {
    logger.error('OAuth Callback Error:', error);
    res.status(500).send('Authentication failed');
  }
});

// API Routes for Dashboard
app.get('/api/comments', async (req, res) => {
  try {
    const { status, sentiment } = req.query;
    const query = {};
    if (status) query.status = status;
    if (sentiment) query.sentiment = sentiment;

    const comments = await Comment.find(query).sort({ publishedAt: -1 }).limit(100);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/comments/:id/action', async (req, res) => {
  try {
    const { action } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).send('Comment not found');

    const channel = await Channel.findOne({ channelId: process.env.CHANNEL_ID });
    const youtube = getYouTubeClient({ access_token: channel.accessToken, refresh_token: channel.refreshToken });

    if (action === 'approve') {
      comment.status = 'approved';
    } else if (action === 'delete') {
      await youtube.comments.delete({ id: comment.youtubeId });
      comment.status = 'deleted';
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Moderation Logic
async function processComments(channelId, tokens) {
  try {
    const youtube = getYouTubeClient(tokens);
    const channel = await Channel.findOne({ channelId });
    const comments = await fetchLatestComments(youtube, channelId);

    for (const c of comments) {
      const exists = await Comment.findOne({ youtubeId: c.youtubeId });
      if (exists) continue;

      const aiResult = await classifyComment(c.text);
      
      const newComment = new Comment({
        ...c,
        sentiment: aiResult.sentiment,
        toxicityScore: aiResult.toxicityScore,
        confidence: aiResult.confidence,
        status: aiResult.sentiment === 'toxic' ? 'flagged' : 'pending'
      });

      const confidence = aiResult.confidence;
      const threshold = channel?.settings?.confidenceThreshold || 0.85;

      if (confidence >= threshold) {
        if (aiResult.sentiment === 'positive' && channel?.settings?.autoLikePositive) {
          await likeComment(youtube, c.youtubeId);
          newComment.aiActionTaken = true;
          
          if (channel?.settings?.autoReplyPositive) {
            try {
              await youtube.comments.insert({
                part: 'snippet',
                requestBody: {
                  snippet: {
                    parentId: c.youtubeId,
                    textOriginal: channel.settings.autoReplyMessage || 'Thanks for the great comment!'
                  }
                }
              });
              logger.info(`Auto-replied to comment: ${c.youtubeId}`);
            } catch (err) {
              logger.error('Auto-reply failed:', err);
            }
          }
        }

        if (aiResult.sentiment === 'toxic' && confidence >= 0.90) {
          try {
            await youtube.comments.delete({ id: c.youtubeId });
            newComment.status = 'deleted';
            newComment.aiActionTaken = true;
            logger.info(`Auto-deleted high-confidence toxic comment: ${c.youtubeId}`);
          } catch (err) {
            logger.error('Auto-delete failed:', err);
          }
        }
      }

      await newComment.save();
    }
    logger.info(`Processed ${comments.length} comments for channel ${channelId}`);
  } catch (error) {
    logger.error('Error processing comments:', error);
  }
}

cron.schedule('*/5 * * * *', async () => {
  logger.info('Running scheduled comment check...');
  const channels = await Channel.find();
  for (const channel of channels) {
    processComments(channel.channelId, {
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken,
      expiry_date: channel.expiryDate
    });
  }
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
