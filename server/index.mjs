import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from './log.mjs';
import { getYouTubeClient, getYouTubeAuth, fetchLatestComments, likeComment } from './services/youtubeService.mjs';
import { classifyComment } from './services/aiService.mjs';
import Comment from './models/Comment.mjs';
import Channel from './models/Channel.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production-grade .env loader
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  logger.error('CRITICAL: MONGODB_URI is missing from .env!');
}

mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/yt-moderator')
  .then(() => logger.info('MongoDB Connected Successfully'))
  .catch(err => logger.error('MongoDB Connection Error:', err));

// YouTube OAuth Setup (restarting to pick up env)
const oauth2Client = getYouTubeAuth();

// Routes
app.get('/', (req, res) => res.send('AI YouTube Moderator API is running.'));

app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/youtube.force-ssl'],
  });
  logger.info(`Sending OAuth request with redirect URI: ${process.env.REDIRECT_URI}`);
  res.redirect(authUrl);
});

app.get('/oauth', (req, res) => res.redirect('/auth'));

app.get('/api/youtube/callback', async (req, res) => {
  try {
    logger.info(`OAuth callback hit with code: ${req.query.code ? 'PRESENT' : 'MISSING'}`);
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
        thumbnailUrl: channelData.snippet.thumbnails.default.url,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      },
      { upsert: true }
    );

    // Redirect back to frontend
    res.redirect('http://localhost:5173/?connected=true');
    processComments(channelData.id, tokens);
  } catch (error) {
    logger.error('OAuth Callback Error:', error);
    res.redirect('http://localhost:5173/?error=auth_failed');
  }
});

// API Routes for Dashboard
app.get('/api/youtube/channels', async (req, res) => {
  try {
    const channels = await Channel.find().select('title channelId thumbnailUrl');
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/youtube/disconnect', async (req, res) => {
  try {
    const { channelId } = req.body;
    await Channel.findOneAndDelete({ channelId });
    res.json({ success: true, message: 'Disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/comments', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected yet.' });
    }
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

    const channel = await Channel.findOne();
    const youtube = getYouTubeClient({ 
      access_token: channel.accessToken, 
      refresh_token: channel.refreshToken 
    });

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

      await newComment.save();
    }
  } catch (error) {
    logger.error('Error processing comments:', error);
  }
}

// Scheduled check
cron.schedule('*/5 * * * *', async () => {
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
