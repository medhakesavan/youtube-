import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  youtubeId: { type: String, required: true, unique: true },
  videoId: { type: String, required: true },
  text: { type: String, required: true },
  author: { type: String, required: true },
  authorProfileImageUrl: String,
  publishedAt: { type: Date, required: true },
  sentiment: { 
    type: String, 
    enum: ['positive', 'neutral', 'moderate', 'toxic'], 
    default: 'neutral' 
  },
  category: { type: String, default: 'none' },
  toxicityScore: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'deleted', 'flagged', 'hidden'], 
    default: 'pending' 
  },
  autoLiked: { type: Boolean, default: false },
  note: { type: String, default: '' },
  deletedReason: String,
  aiActionTaken: { type: Boolean, default: false },
  moderatedBy: String,
  moderatedAt: Date,
}, { timestamps: true });

// Index for faster searching and trending
commentSchema.index({ videoId: 1, sentiment: 1 });
commentSchema.index({ status: 1 });

export default mongoose.model('Comment', commentSchema);
