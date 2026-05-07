import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  PlaySquare, 
  MessageSquare, 
  Clock, 
  RefreshCw, 
  Loader2,
  ChevronRight,
  Filter,
  Trash2,
  ThumbsUp,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { getSentimentConfig, SENTIMENT_COLORS } from '../constants/sentimentColors';

const VideosList = ({ channelId, onAction, searchQuery }) => {
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (channelId) {
      fetchVideos();
    }
  }, [channelId]);

  const fetchVideos = async () => {
    try {
      setLoadingVideos(true);
      const res = await api.get('/youtube/videos', { params: { channelId } });
      setVideos(res.data.videos);
      if (res.data.videos.length > 0 && !selectedVideo) {
        handleVideoSelect(res.data.videos[0].videoId);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleVideoSelect = async (videoId) => {
    try {
      setSelectedVideo(videoId);
      setLoadingComments(true);
      const res = await api.get(`/comments/${videoId}`, { params: { channelId } });
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const [processingId, setProcessingId] = useState(null);

  const handleAction = async (id, action) => {
    // Optimistic UI Update
    const originalComments = [...comments];
    
    try {
      setProcessingId(id);
      
      // Update local state immediately for better UX
      setComments(prev => prev.map(c => {
        if (c._id !== id) return c;
        const updated = { ...c };
        if (action === 'approve') updated.status = 'approved';
        if (action === 'delete') updated.status = 'deleted';
        if (action === 'hide') updated.status = 'flagged';
        if (action === 'like') updated.autoLiked = true;
        return updated;
      }));

      const res = await api.post(`/comments/${id}/action`, { action });
      
      if (!res.data.success) {
        throw new Error(res.data.error || 'Action failed');
      }

      // Sync stats in parent
      if (onAction) onAction();
      
    } catch (err) {
      console.error('Action failed:', err);
      // Revert on failure
      setComments(originalComments);
      
      const errorMsg = err.response?.data?.error || err.message || 'Moderation action failed.';
      alert(`Action failed: ${errorMsg}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAudit = async () => {
    if (!selectedVideo) return;
    try {
      setLoadingComments(true);
      await api.get(`/youtube/comments/analyze/${selectedVideo}`, { params: { channelId } });
      handleVideoSelect(selectedVideo);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const filteredComments = comments.filter(c => {
    if (filter === 'all') return true;
    return c.sentiment === filter;
  });

  const getStatsForFilter = (type) => {
    if (type === 'all') return comments.length;
    return comments.filter(c => c.sentiment === type).length;
  };

  const filters = [
    { id: 'all', label: 'All', color: 'bg-[#f2f2f2] text-[#0f0f0f]' },
    { id: 'positive', label: 'Positive', color: `${SENTIMENT_COLORS.positive.bgColor} ${SENTIMENT_COLORS.positive.iconColor}` },
    { id: 'toxic', label: 'Toxic', color: `${SENTIMENT_COLORS.toxic.bgColor} ${SENTIMENT_COLORS.toxic.iconColor}` },
    { id: 'moderate', label: 'Moderate', color: `${SENTIMENT_COLORS.moderate.bgColor} ${SENTIMENT_COLORS.moderate.iconColor}` },
    { id: 'neutral', label: 'Neutral', color: `${SENTIMENT_COLORS.neutral.bgColor} ${SENTIMENT_COLORS.neutral.iconColor}` },
  ];

  if (loadingVideos && videos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ff0000]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 overflow-hidden">
      {/* Left Pane: Videos List */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-hidden">
        <div className="yt-card !p-0 flex flex-col h-full overflow-hidden">
           <div className="p-5 border-b border-[#f0f0f0] flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-lg font-black text-[#0f0f0f] tracking-tight">Channel Videos</h3>
              <button onClick={fetchVideos} className="p-2 hover:bg-[#f2f2f2] rounded-full text-[#909090] transition-colors">
                 <RefreshCw size={18} className={loadingVideos ? 'animate-spin' : ''} />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scroll p-2">
              {videos.map((video) => (
                <button
                  key={video.videoId}
                  onClick={() => handleVideoSelect(video.videoId)}
                  className={`w-full flex gap-3 p-3 rounded-xl transition-all text-left mb-1 group ${
                    selectedVideo === video.videoId ? 'bg-[#fff1f0] border border-[#ff0000]/10' : 'hover:bg-[#f9f9f9] border border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-[#f0f0f0] shadow-sm">
                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <h4 className={`text-[13px] font-bold line-clamp-2 leading-snug ${selectedVideo === video.videoId ? 'text-[#ff0000]' : 'text-[#0f0f0f]'}`}>
                      {video.title}
                    </h4>
                    <p className="text-[11px] font-medium text-[#909090] mt-1 flex items-center gap-1">
                      <Clock size={12} /> {formatDistanceToNow(new Date(video.publishedAt))} ago
                    </p>
                  </div>
                  {selectedVideo === video.videoId && <ChevronRight size={16} className="text-[#ff0000] self-center" />}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Right Pane: Analysis & Comments */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="yt-card !p-0 flex flex-col h-full overflow-hidden">
          {/* Header & Filters */}
          <div className="p-6 border-b border-[#f0f0f0] bg-white sticky top-0 z-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
               <div>
                  <h3 className="text-xl font-black text-[#0f0f0f] tracking-tight">Video Analysis</h3>
                  <p className="text-xs text-[#909090] font-medium mt-1">AI-driven auditing for your latest content</p>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={handleAudit} className="yt-btn-primary !py-2 !px-4">
                    <RefreshCw size={16} className={loadingComments ? 'animate-spin' : ''} /> Audit Again
                  </button>
                  <a 
                    href={`https://youtube.com/watch?v=${selectedVideo}`} 
                    target="_blank" 
                    className="p-2.5 bg-[#f8f8f8] border border-[#e5e5e5] rounded-xl hover:bg-[#f2f2f2] transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
               </div>
            </div>

            <div className="flex flex-wrap gap-2">
               {filters.map(f => (
                 <button
                   key={f.id}
                   onClick={() => setFilter(f.id)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                     filter === f.id ? 'bg-[#0f0f0f] text-white border-[#0f0f0f] shadow-md scale-105' : `bg-white border-[#e5e5e5] ${f.color.split(' ')[1]} hover:border-[#cccccc]`
                   }`}
                 >
                   {f.label}
                   <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filter === f.id ? 'bg-white/20 text-white' : 'bg-[#f0f0f0] text-[#606060]'}`}>
                     {getStatsForFilter(f.id)}
                   </span>
                 </button>
               ))}
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto custom-scroll p-6 bg-[#fafafa]">
             {loadingComments ? (
               <div className="h-full flex flex-col items-center justify-center gap-4 text-[#909090]">
                 <Loader2 className="animate-spin text-[#ff0000]" size={32} />
                 <p className="text-sm font-bold uppercase tracking-widest">Analysing Feedback...</p>
               </div>
             ) : filteredComments.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-[#909090] opacity-50">
                 <MessageSquare size={48} className="mb-4" />
                 <p className="text-lg font-bold">No comments found</p>
               </div>
             ) : (
               <div className="space-y-4 max-w-[900px] mx-auto">
                 {filteredComments
                    .filter(c => c.text.toLowerCase().includes((searchQuery || '').toLowerCase()) || c.author.toLowerCase().includes((searchQuery || '').toLowerCase()))
                    .map((comment, index) => (
                   <motion.div 
                     key={comment._id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.05 }}
                     className={`bg-white border border-[#f0f0f0] p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all group ${comment.status === 'deleted' ? 'opacity-40 grayscale' : ''}`}
                   >
                     <div className="flex gap-4">
                        <div className="relative flex-shrink-0">
                           <img 
                            src={comment.authorProfileImageUrl || `https://ui-avatars.com/api/?name=${comment.author}&background=random`} 
                            className="w-11 h-11 rounded-full border border-[#f0f0f0]" 
                            alt=""
                           />
                           <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center" style={{ backgroundColor: getSentimentConfig(comment.sentiment).color }}>
                              {comment.sentiment === 'toxic' ? <ShieldAlert size={8} className="text-white" /> : <ThumbsUp size={8} className="text-white" />}
                           </div>
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-[14px] text-[#0f0f0f]">@{comment.author}</span>
                                <span className={`yt-badge ${getSentimentConfig(comment.sentiment).badgeClass}`}>
                                  {comment.sentiment}
                                </span>
                                {comment.status === 'deleted' && <span className="text-[10px] font-bold text-[#d93025] uppercase tracking-widest">[Deleted]</span>}
                              </div>
                              <span className="text-[11px] font-bold text-[#909090] uppercase tracking-tighter">
                                {formatDistanceToNow(new Date(comment.publishedAt))} ago
                              </span>
                           </div>
                           <p className="text-[14px] text-[#222] leading-relaxed mb-4">{comment.text}</p>
                           
                           {comment.status !== 'deleted' && (
                             <div className="flex items-center justify-between border-t border-[#f8f8f8] pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-4 text-[#909090]">
                                   <button 
                                      onClick={() => handleAction(comment._id, 'approve')} 
                                      disabled={processingId === comment._id}
                                      className={`flex items-center gap-1.5 hover:text-[#2ba640] transition-colors text-xs font-bold ${processingId === comment._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title="Approve & Publish"
                                    >
                                       {processingId === comment._id ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} 
                                       Approve
                                   </button>
                                   <button 
                                      onClick={() => handleAction(comment._id, 'like')} 
                                      disabled={processingId === comment._id || comment.autoLiked}
                                      className={`flex items-center gap-1.5 hover:text-[#065fd4] transition-colors text-xs font-bold ${processingId === comment._id || comment.autoLiked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title="Like on YouTube"
                                    >
                                       {processingId === comment._id ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} className={comment.autoLiked ? 'fill-[#065fd4]' : ''} />} 
                                       {comment.autoLiked ? 'Liked' : 'Like'}
                                   </button>
                                   <button 
                                      onClick={() => handleAction(comment._id, 'hide')} 
                                      disabled={processingId === comment._id}
                                      className={`flex items-center gap-1.5 hover:text-[#f9ab00] transition-colors text-xs font-bold ${processingId === comment._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title="Hide from Public (Held for Review)"
                                    >
                                       {processingId === comment._id ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />} 
                                       Hide
                                   </button>
                                   <button 
                                      onClick={() => handleAction(comment._id, 'delete')} 
                                      disabled={processingId === comment._id}
                                      className={`flex items-center gap-1.5 hover:text-[#d93025] transition-colors text-xs font-bold ${processingId === comment._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title="Permanently Delete"
                                    >
                                       {processingId === comment._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} 
                                       Remove
                                   </button>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getSentimentConfig(comment.sentiment).color }}></div>
                                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: getSentimentConfig(comment.sentiment).color }}>
                                    AI Score: {Math.round((comment.confidence || 0) * 100)}%
                                  </span>
                                </div>
                             </div>
                           )}
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideosList;
