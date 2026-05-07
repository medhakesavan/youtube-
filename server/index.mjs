import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './log.mjs';

// ── Global Error Handlers (PREVENT CRASH) ──────────────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    worker: "global-uncaught-exception"
  });
  // Do NOT process.exit(1) unless it's a critical memory error
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    error: reason?.message || reason,
    stack: reason?.stack,
    worker: "global-unhandled-rejection"
  });
});

import { getYouTubeClient, getYouTubeAuth, fetchLatestComments, likeComment, deleteCommentFromYouTube, hideComment, replyToComment } from './services/youtubeService.mjs';
import { classifyComment } from './services/aiService.mjs';
import Comment from './models/Comment.mjs';
import Channel from './models/Channel.mjs';
import User from './models/User.mjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { authMiddleware } from './middleware/auth.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

// ── Validate required env vars at startup ─────────────────────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'REDIRECT_URI'];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  logger.error(`CRITICAL: Missing env vars: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 5000;

import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://youtube-peach-alpha.vercel.app',
      ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',') : []),
    ],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  socket.on('disconnect', () => logger.info('Client disconnected'));
});

app.set('io', io);

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://youtube-peach-alpha.vercel.app',
      ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',') : []),
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ── MongoDB ────────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB Connected Successfully'))
  .catch((err) => {
    logger.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// ── Routes ─────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.send('AI YouTube Moderator API is running.'));

// ── App Authentication ──────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback';

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all fields' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    logger.error('Registration Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    logger.error('Login Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// ── Admin Seeder ──────────────────────────────────────────────────────────────
async function seedAdmin() {
  try {
    const adminEmail = 'admin@youtubeai.test';
    const exists = await User.findOne({ email: adminEmail });
    if (!exists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await new User({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword
      }).save();
      logger.info('✅ Admin account seeded: admin@youtubeai.test');
    }
  } catch (err) {
    logger.error('Seeder Error:', err);
  }
}
seedAdmin();

// Routes are now correctly handled in the auth section above

// Kick off OAuth flow — each request gets its own fresh client
app.get('/auth', (_req, res) => {
  const client = getYouTubeAuth();
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ],
  });
  logger.info(`Sending OAuth request with redirect URI: ${process.env.REDIRECT_URI}`);
  res.redirect(authUrl);
});

app.get('/oauth', (_req, res) => res.redirect('/auth'));

// OAuth callback
app.get('/api/youtube/callback', async (req, res) => {
  const { code, error: oauthError } = req.query;

  if (oauthError) {
    logger.warn(`OAuth denied by user: ${oauthError}`);
    return res.redirect(`${FRONTEND_URL}/?error=access_denied`);
  }

  if (!code) {
    logger.warn('OAuth callback hit with no code');
    return res.redirect(`${FRONTEND_URL}/?error=missing_code`);
  }

  // Each callback gets its own client instance to avoid token collisions
  const client = getYouTubeAuth();

  try {
    logger.info('OAuth callback hit with code: PRESENT');

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const youtube = getYouTubeClient(tokens);
    const channelRes = await youtube.channels.list({ part: 'snippet,contentDetails', mine: true });
    const items = channelRes.data.items;

    if (!items || items.length === 0) {
      throw new Error(
        'No YouTube channel found for this Google account. Please create a YouTube channel first.'
      );
    }

    const channelData = items[0];
    const uploadsPlaylistId = channelData.contentDetails?.relatedPlaylists?.uploads || '';

    const updateData = {
      channelId: channelData.id,
      title: channelData.snippet.title,
      thumbnailUrl: channelData.snippet.thumbnails?.default?.url || '',
      accessToken: tokens.access_token,
      uploadsPlaylistId,
    };

    if (tokens.refresh_token) updateData.refreshToken = tokens.refresh_token;
    if (tokens.expiry_date) updateData.expiryDate = tokens.expiry_date;

    await Channel.findOneAndUpdate(
      { channelId: channelData.id },
      { $set: updateData },
      { upsert: true, new: true }
    );

    logger.info(`Channel connected: ${channelData.snippet.title} (${channelData.id})`);

    // Redirect first, then process comments in background
    res.redirect(`${FRONTEND_URL}/?connected=true`);

    // Fire-and-forget with proper error containment
    processComments(channelData.id, tokens).catch((err) =>
      logger.error('Background processComments error:', err)
    );
  } catch (error) {
    logger.error('OAuth Callback Error:', error);
    const reason = encodeURIComponent(error.message || 'unknown_error');
    res.redirect(`${FRONTEND_URL}/?error=auth_failed&reason=${reason}`);
  }
});

// ── API: Channels ──────────────────────────────────────────────────────────────
app.get('/api/youtube/channels', authMiddleware, async (_req, res) => {
  try {
    const channels = await Channel.find().select('title channelId thumbnailUrl');
    res.json(channels);
  } catch (error) {
    logger.error('GET /api/youtube/channels error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/youtube/disconnect', authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.body;
    if (!channelId) return res.status(400).json({ error: 'channelId is required' });

    const deleted = await Channel.findOneAndDelete({ channelId });
    if (!deleted) return res.status(404).json({ error: 'Channel not found' });

    res.json({ success: true, message: 'Disconnected successfully' });
  } catch (error) {
    logger.error('POST /api/youtube/disconnect error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── API: YouTube Videos & Comments ─────────────────────────────────────────────
app.get('/api/youtube/videos', authMiddleware, async (req, res) => {
  try {
    const { channelId, pageToken } = req.query;
    const query = channelId ? { channelId } : {};
    const channel = await Channel.findOne(query);

    if (!channel) {
      return res.status(404).json({ error: 'No channel connected' });
    }

    const youtube = getYouTubeClient({
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken,
      expiry_date: channel.expiryDate,
    });

    let uploadsPlaylistId = channel.uploadsPlaylistId;

    // Auto-fetch missing uploads playlist ID if existing channel was connected before this feature
    if (!uploadsPlaylistId) {
      try {
        const channelRes = await youtube.channels.list({ part: 'contentDetails', id: channel.channelId });
        if (channelRes.data.items && channelRes.data.items.length > 0) {
          uploadsPlaylistId = channelRes.data.items[0].contentDetails?.relatedPlaylists?.uploads;
          channel.uploadsPlaylistId = uploadsPlaylistId;
          await channel.save();
        }
      } catch (e) {
        logger.error('Error fetching fallback uploadsPlaylistId:', e);
      }
    }

    if (!uploadsPlaylistId) {
      return res.status(404).json({ error: 'Could not resolve uploads playlist for this channel' });
    }

    const response = await youtube.playlistItems.list({
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken: pageToken || undefined
    });

    const videos = response.data.items.map(item => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt
    }));

    res.json({
      videos,
      nextPageToken: response.data.nextPageToken
    });

  } catch (error) {
    logger.error('GET /api/youtube/videos error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/youtube/comments/analyze/:videoId', authMiddleware, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { channelId } = req.query;

    const query = channelId ? { channelId } : {};
    const channel = await Channel.findOne(query);
    if (!channel) return res.status(404).json({ error: 'No channel connected' });

    const youtube = getYouTubeClient({
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken,
      expiry_date: channel.expiryDate,
    });

    const ytRes = await youtube.commentThreads.list({
      part: 'snippet',
      videoId,
      maxResults: 50,
      textFormat: 'plainText'
    });

    const ytItems = ytRes.data.items || [];
    const analyzedComments = [];

    for (const item of ytItems) {
      const snippet = item.snippet.topLevelComment.snippet;
      const ytId = item.snippet.topLevelComment.id;

      let existing = await Comment.findOne({ youtubeId: ytId });
      
      if (!existing) {
        const aiResult = await classifyComment(snippet.textDisplay);
        
        let status = aiResult.sentiment === 'toxic' ? 'flagged' : 'pending';
        
        // AUTO-DELETE HIGH CONFIDENCE TOXICITY
        if (aiResult.sentiment === 'toxic' && aiResult.confidence > 0.9) {
          try {
            logger.info(`AUTO-DELETE: Deleting high-confidence toxic comment: ${ytId}`);
            await youtube.comments.delete({ id: ytId });
            status = 'deleted';
          } catch (delError) {
            logger.error(`Failed to auto-delete comment ${ytId}:`, delError.message);
            // Fallback to flagged if delete fails
          }
        }

        existing = new Comment({
          youtubeId: ytId,
          videoId,
          text: snippet.textDisplay,
          author: snippet.authorDisplayName,
          authorProfileImageUrl: snippet.authorProfileImageUrl,
          publishedAt: new Date(snippet.publishedAt),
          sentiment: aiResult.sentiment,
          toxicityScore: aiResult.toxicityScore,
          confidence: aiResult.confidence,
          status: status
        });
        await existing.save();
      }
      analyzedComments.push(existing);
    }

    res.json(analyzedComments);
  } catch (error) {
    logger.error('Analyze comments error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/youtube/comments', authMiddleware, async (req, res) => {
  try {
    const { videoId, pageToken, channelId } = req.query;
    if (!videoId) return res.status(400).json({ error: 'videoId is required' });

    const query = channelId ? { channelId } : {};
    const channel = await Channel.findOne(query);
    if (!channel) {
      return res.status(404).json({ error: 'No channel connected' });
    }

    const youtube = getYouTubeClient({
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken,
      expiry_date: channel.expiryDate,
    });

    const response = await youtube.commentThreads.list({
      part: 'snippet',
      videoId,
      maxResults: 100,
      pageToken: pageToken || undefined,
      textFormat: 'plainText'
    });

    const comments = response.data.items.map(item => ({
      commentId: item.snippet.topLevelComment.id,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt
    }));

    res.json({
      comments,
      nextPageToken: response.data.nextPageToken
    });

  } catch (error) {
    logger.error('GET /api/youtube/comments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── API: Comments Sync & Fetch ──────────────────────────────────────────────────
app.get('/api/comments/:videoId', authMiddleware, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { channelId } = req.query;

    // 1. Resolve Channel
    const query = channelId ? { channelId } : {};
    const channel = await Channel.findOne(query);
    if (!channel) return res.status(404).json({ error: 'No channel connected' });

    const youtube = getYouTubeClient({
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken,
      expiry_date: channel.expiryDate,
    });

    // 2. Fetch Latest from YouTube
    logger.info(`Fetching latest comments from YouTube for video: ${videoId}`);
    const ytRes = await youtube.commentThreads.list({
      part: 'snippet',
      videoId,
      maxResults: 50,
      textFormat: 'plainText'
    });

    const ytItems = ytRes.data.items || [];
    
    // 3. Upsert into Database
    const savedComments = [];
    for (const item of ytItems) {
      const snippet = item.snippet.topLevelComment.snippet;
      const ytId = item.snippet.topLevelComment.id;

      const commentData = {
        youtubeId: ytId,
        videoId,
        text: snippet.textDisplay,
        author: snippet.authorDisplayName,
        authorProfileImageUrl: snippet.authorProfileImageUrl,
        publishedAt: new Date(snippet.publishedAt),
      };

      // Use findOneAndUpdate with upsert to prevent duplicates
      let existing = await Comment.findOne({ youtubeId: ytId });
      
      let status = 'pending';
      let sentiment = 'neutral';
      let toxicityScore = 0;
      let confidence = 0;

      if (!existing) {
        // New comment: Analyze it
        const aiResult = await classifyComment(snippet.textDisplay);
        sentiment = aiResult.sentiment;
        toxicityScore = aiResult.toxicityScore;
        confidence = aiResult.confidence;
        status = sentiment === 'toxic' ? 'flagged' : 'pending';

        // AUTO-DELETE HIGH CONFIDENCE TOXICITY
        if (sentiment === 'toxic' && confidence > 0.9) {
          try {
            logger.info(`AUTO-DELETE: Deleting high-confidence toxic comment: ${ytId}`);
            await youtube.comments.delete({ id: ytId });
            status = 'deleted';
          } catch (delError) {
            logger.error(`Failed to auto-delete comment ${ytId}:`, delError.message);
          }
        }
      } else {
        // Keep existing status unless we want to re-analyze
        status = existing.status;
        sentiment = existing.sentiment;
        toxicityScore = existing.toxicityScore;
        confidence = existing.confidence;
      }

      const updated = await Comment.findOneAndUpdate(
        { youtubeId: ytId },
        { 
          $set: {
            ...commentData,
            status,
            sentiment,
            toxicityScore,
            confidence
          } 
        },
        { upsert: true, new: true }
      );
      savedComments.push(updated);
    }

    // 4. Trigger Analysis for any 'pending' comments in this set
    // (In a real app, this might be a background task, but we'll do a quick check here)
    const pending = savedComments.filter(c => c.status === 'pending');
    if (pending.length > 0) {
      // Small delay or background trigger could be added here
      // For now, we'll return what we have and assume background sync catches up
    }

    // 5. Return full list from DB for this video
    const allComments = await Comment.find({ videoId }).sort({ publishedAt: -1 });
    res.json(allComments);

  } catch (error) {
    logger.error('Sync error in GET /api/comments/:videoId:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/comments', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected yet.' });
    }

    const { status, sentiment, autoLiked, videoId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (sentiment) query.sentiment = sentiment;
    if (autoLiked !== undefined) query.autoLiked = autoLiked === 'true';
    if (videoId) query.videoId = videoId;

    const comments = await Comment.find(query).sort({ publishedAt: -1 }).limit(100);
    res.json(comments);
  } catch (error) {
    logger.error('GET /api/comments error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/comments/:id/action', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { action, replyText } = req.body;

  logger.info(`Moderation Request: Action=${action}, ID=${id}`);

  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      logger.warn(`Action failed: Comment ${id} not found`);
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    const channel = await Channel.findOne({ channelId: comment.channelId }) || await Channel.findOne();
    if (!channel) {
      logger.error('Action failed: No connected channel found');
      return res.status(404).json({ success: false, error: 'No channel connected' });
    }

    const youtube = getYouTubeClient({
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken,
      expiry_date: channel.expiryDate,
    });

    let success = false;
    let detail = '';

    switch (action) {
      case 'approve':
        comment.status = 'approved';
        success = true;
        break;
      
      case 'delete':
        success = await deleteCommentFromYouTube(youtube, comment.youtubeId);
        if (success) comment.status = 'deleted';
        break;

      case 'like':
        success = await likeComment(youtube, comment.youtubeId);
        if (success) comment.autoLiked = true;
        break;

      case 'hide':
        success = await hideComment(youtube, comment.youtubeId);
        if (success) comment.status = 'flagged';
        break;

      case 'reply':
        if (!replyText) {
          return res.status(400).json({ success: false, error: 'Reply text is required' });
        }
        success = await replyToComment(youtube, comment.youtubeId, replyText);
        if (success) comment.status = 'approved'; // Assuming reply implies approval
        break;

      default:
        return res.status(400).json({ success: false, error: `Unsupported action: ${action}` });
    }

    if (!success) {
      logger.error(`YouTube API Action Failed: ${action} on ${comment.youtubeId}`);
      return res.status(500).json({ 
        success: false, 
        error: `YouTube API failed to perform ${action}. This often happens if the comment was already removed or if permission was denied.` 
      });
    }

    await comment.save();
    
    // Real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('stats_updated');
      io.emit('new_activity', {
        type: action,
        text: comment.text,
        author: comment.author,
        timestamp: new Date()
      });
    }
    
    logger.info(`Moderation Success: ${action} on ${id}`);
    res.json({ success: true, comment });

  } catch (error) {
    logger.error(`Moderation Controller Error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/comments/:id/edit', authMiddleware, async (req, res) => {
  try {
    const { sentiment, status, note } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $set: { sentiment, status, note } },
      { new: true }
    );
    
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    const io = app.get('io');
    if (io) io.emit('stats_updated');
    
    res.json(comment);
  } catch (error) {
    logger.error('Edit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── API: Analytics ─────────────────────────────────────────────────────────────
app.get('/api/analytics', authMiddleware, async (req, res) => {
  try {
    const totalComments = await Comment.countDocuments();
    const toxicDeleted = await Comment.countDocuments({ status: 'deleted' });
    const positiveLiked = await Comment.countDocuments({ autoLiked: true });
    const pendingModeration = await Comment.countDocuments({ status: { $in: ['pending', 'flagged'] } });

    // Category breakdown with 4 specific types
    const sentimentCounts = await Comment.aggregate([
      { $group: { _id: '$sentiment', count: { $sum: 1 } } }
    ]);

    // Ensure all 4 categories exist in response for charts
    const categoriesMap = { positive: 0, neutral: 0, moderate: 0, toxic: 0 };
    sentimentCounts.forEach(c => {
      if (categoriesMap.hasOwnProperty(c._id)) {
        categoriesMap[c._id] = c.count;
      }
    });

    const categories = Object.keys(categoriesMap).map(key => ({
      _id: key,
      count: categoriesMap[key]
    }));

    // Trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trends = await Comment.aggregate([
      { $match: { publishedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
          toxic: { $sum: { $cond: [{ $eq: ["$sentiment", "toxic"] }, 1, 0] } },
          positive: { $sum: { $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      totalComments,
      toxicDeleted,
      positiveLiked,
      pendingModeration,
      categories,
      trends
    });
  } catch (error) {
    logger.error('Analytics Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── Background Auto-Moderation Worker (every 2 min) ─────────────────────────────
cron.schedule('*/2 * * * *', async () => {
  const io = app.get('io');
  try {
    const channels = await Channel.find();
    for (const channel of channels) {
      try {
        const youtube = getYouTubeClient({
          access_token: channel.accessToken,
          refresh_token: channel.refreshToken,
          expiry_date: channel.expiryDate,
        });

        const uploadsRes = await youtube.channels.list({ part: 'contentDetails', id: channel.channelId });
        const uploadsPlaylistId = uploadsRes.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
        if (!uploadsPlaylistId) continue;

        const playlistRes = await youtube.playlistItems.list({ part: 'snippet', playlistId: uploadsPlaylistId, maxResults: 5 });
        const recentVideos = playlistRes.data.items.map(v => v.snippet.resourceId.videoId);

        for (const videoId of recentVideos) {
          const ytRes = await youtube.commentThreads.list({ part: 'snippet', videoId, maxResults: 20 });
          for (const item of (ytRes.data.items || [])) {
            const snippet = item.snippet.topLevelComment.snippet;
            const ytId = item.snippet.topLevelComment.id;
            if (await Comment.findOne({ youtubeId: ytId })) continue;

            const aiResult = await classifyComment(snippet.textDisplay);
            const validSentiments = ['positive', 'neutral', 'moderate', 'toxic'];
            const sentiment = validSentiments.includes(aiResult.sentiment) ? aiResult.sentiment : 'neutral';
            let status = sentiment === 'toxic' || sentiment === 'moderate' ? 'flagged' : 'pending';
            let autoLiked = false;

            if (sentiment === 'toxic' && aiResult.confidence > 0.75) {
              try {
                await youtube.comments.delete({ id: ytId });
                status = 'deleted';
                if (io) io.emit('live_activity', { type: 'delete', author: snippet.authorDisplayName, text: snippet.textDisplay, sentiment: 'toxic', confidence: aiResult.confidence });
              } catch (e) { logger.error(`Worker delete failed ${ytId}:`, e.message); }
            } else if (sentiment === 'positive' && aiResult.confidence > 0.85) {
              try {
                await youtube.comments.setRating({ id: ytId, rating: 'like' });
                autoLiked = true;
              } catch (e) { logger.error(`Worker like failed ${ytId}:`, e.message); }
            }

            await new Comment({
              youtubeId: ytId, videoId,
              text: snippet.textDisplay,
              author: snippet.authorDisplayName,
              authorProfileImageUrl: snippet.authorProfileImageUrl,
              publishedAt: new Date(snippet.publishedAt),
              sentiment, toxicityScore: aiResult.toxicityScore,
              confidence: aiResult.confidence,
              status, autoLiked, aiActionTaken: status === 'deleted' || autoLiked
            }).save();
          }
        }
      } catch (channelErr) {
        logger.error(`Worker error [${channel.channelId}]:`, channelErr.message);
      }
    }
    if (io) io.emit('stats_updated');
  } catch (err) {
    logger.error('Background worker critical error:', err.message);
  }
});

// ── STRICT Auto-Moderation Engine ──────────────────────────────────────────────
const activeModerationTasks = new Map();

app.post('/api/auto-moderate/:videoId', authMiddleware, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { action } = req.body; // 'start' or 'stop'
    const { channelId } = req.query;

    if (action === 'stop') {
      if (activeModerationTasks.has(videoId)) {
        clearInterval(activeModerationTasks.get(videoId));
        activeModerationTasks.delete(videoId);
        return res.json({ success: true, message: 'Auto-moderation stopped' });
      }
      return res.json({ success: true, message: 'No active task found' });
    }

    if (activeModerationTasks.has(videoId)) {
      return res.json({ success: true, message: 'Auto-moderation already running' });
    }

    const channel = await Channel.findOne(channelId ? { channelId } : {});
    if (!channel) return res.status(404).json({ error: 'No channel connected' });

    // Start 10-second polling interval
    const interval = setInterval(async () => {
      try {
        const youtube = getYouTubeClient({
          access_token: channel.accessToken,
          refresh_token: channel.refreshToken,
          expiry_date: channel.expiryDate,
        });

        const ytRes = await youtube.commentThreads.list({
          part: 'snippet',
          videoId,
          maxResults: 10
        });

        const items = ytRes.data.items || [];
        for (const item of items) {
          const snippet = item.snippet.topLevelComment.snippet;
          const ytId = item.snippet.topLevelComment.id;

          const exists = await Comment.findOne({ youtubeId: ytId });
          if (!exists) {
            const aiResult = await classifyComment(snippet.textDisplay);
            
            if (aiResult.sentiment === 'toxic' && aiResult.toxicityScore >= 1.0) {
              logger.info(`[STRICT] Deleting toxic comment: ${ytId} | Text: ${snippet.textDisplay}`);
              try {
                await youtube.comments.delete({ id: ytId });
                // Record the deletion
                await new Comment({
                  youtubeId: ytId,
                  videoId,
                  text: snippet.textDisplay,
                  author: snippet.authorDisplayName,
                  authorProfileImageUrl: snippet.authorProfileImageUrl,
                  publishedAt: new Date(snippet.publishedAt),
                  sentiment: 'toxic',
                  status: 'deleted'
                }).save();
              } catch (err) {
                logger.error(`STRICT delete failed for ${ytId}:`, err.message);
              }
            }
          }
        }
      } catch (err) {
        logger.error(`Auto-mod interval error for ${videoId}:`, err.message);
      }
    }, 10000); // 10 seconds

    activeModerationTasks.set(videoId, interval);
    res.json({ success: true, message: 'STRICT Auto-moderation started' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
async function processComments(channelId, tokens) {
  try {
    const youtube = getYouTubeClient(tokens);
    const comments = await fetchLatestComments(youtube, channelId, 50);

    if (!comments || comments.length === 0) return;

    const io = app.get('io');
    let newToxic = 0;
    let newLiked = 0;

    for (const c of comments) {
      const exists = await Comment.findOne({ youtubeId: c.youtubeId });
      if (exists) continue;

      const aiResult = await classifyComment(c.text);
      
      let status = 'pending';
      let autoLiked = false;
      let deletedReason = null;

      // 1. AUTO-DELETE TOXIC IMMEDIATELY
      if (aiResult.sentiment === 'toxic' && aiResult.confidence > 0.75) {
        try {
          logger.info(`🚨 AUTO-DELETE: [${aiResult.confidence * 100}%] ${c.author}: ${c.text.substring(0, 50)}`);
          await youtube.comments.delete({ id: c.youtubeId });
          status = 'deleted';
          deletedReason = aiResult.category || 'Auto-deleted by AI Moderation';
          newToxic++;
          
          if (io) {
            io.emit('live_activity', {
              type: 'delete',
              author: c.author,
              text: c.text,
              sentiment: 'toxic',
              confidence: aiResult.confidence
            });
          }
        } catch (err) {
          logger.error(`Delete failed for ${c.youtubeId}:`, err.message);
          status = 'flagged';
        }
      }

      // 2. AUTO-LIKE POSITIVE IMMEDIATELY
      if (status !== 'deleted' && aiResult.sentiment === 'positive' && aiResult.confidence > 0.85) {
        try {
          await youtube.comments.setRating({ id: c.youtubeId, rating: 'like' });
          autoLiked = true;
          newLiked++;
          
          if (io) {
            io.emit('live_activity', {
              type: 'like',
              author: c.author,
              text: c.text,
              sentiment: 'positive',
              confidence: aiResult.confidence
            });
          }
        } catch (err) {
          logger.error(`Like failed for ${c.youtubeId}:`, err.message);
        }
      }

      // 3. FLAG MODERATE FOR REVIEW
      if (status === 'pending' && aiResult.sentiment === 'moderate') {
        status = 'flagged';
      }

      const newComment = new Comment({
        ...c,
        sentiment: aiResult.sentiment,
        category: aiResult.category,
        toxicityScore: aiResult.toxicityScore,
        confidence: aiResult.confidence,
        status,
        autoLiked,
        deletedReason,
        aiActionTaken: status === 'deleted' || autoLiked
      });

      await newComment.save();
      
      if (io) {
        io.emit('new_comment_analyzed', newComment);
      }
    }

    if (newToxic > 0 || newLiked > 0) {
      logger.info(`Worker Sync: ${newToxic} toxic deleted, ${newLiked} positive liked for ${channelId}`);
      if (io) io.emit('stats_updated');
    }
  } catch (error) {
    logger.error(`processComments error for channel ${channelId}:`, error);
  }
}

// ── Background Worker: High Frequency Sync (Every 15 Seconds) ──────────────────
let isCronRunning = false;
cron.schedule('*/15 * * * * *', async () => {
  if (isCronRunning) {
    logger.info('Cron: previous job still running, skipping...');
    return;
  }

  isCronRunning = true;
  try {
    const channels = await Channel.find();
    if (channels.length === 0) {
      isCronRunning = false;
      return;
    }

    logger.info(`Cron: checking ${channels.length} channel(s) for new comments`);
    for (const channel of channels) {
      try {
        await processComments(channel.channelId, {
          access_token: channel.accessToken,
          refresh_token: channel.refreshToken,
          expiry_date: channel.expiryDate,
        });
      } catch (err) {
        logger.error({
          error: err.message,
          channelId: channel.channelId,
          worker: "cron-channel-processor"
        });
      }
    }
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack,
      worker: "cron-main-scheduler"
    });
  } finally {
    isCronRunning = false;
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    logger.error(`CRITICAL: Port ${PORT} is already in use.`);
    logger.info(`Attempting to kill existing process on port ${PORT}...`);
    // In a real production environment we might use a dynamic port or PM2
    // Here we'll just exit gracefully after the log
    process.exit(1);
  } else {
    logger.error('Server error:', e);
  }
});

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Allowed CORS origin: http://localhost:5174`);
});
