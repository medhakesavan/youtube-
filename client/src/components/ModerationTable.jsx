import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  ThumbsUp, 
  Trash2, 
  MessageSquare, 
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getSentimentConfig } from '../constants/sentimentColors';

const ModerationTable = ({ onAction }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentComments();
  }, []);

  const fetchRecentComments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/comments');
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching recent comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.post(`/comments/${id}/action`, { action });
      fetchRecentComments();
      if (onAction) onAction();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="modern-table">
        <thead>
          <tr>
            <th>Comment Info</th>
            <th>Sentiment</th>
            <th>AI Confidence</th>
            <th>Status</th>
            <th>Video</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment._id}>
              <td className="max-w-[300px]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-bold border border-[#333]">
                    {comment.author?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs truncate">@{comment.author}</span>
                    <p className="text-[#aaaaaa] text-xs mt-1 leading-tight line-clamp-2">{comment.text}</p>
                  </div>
                </div>
              </td>
              <td>
                <span className={`yt-badge ${getSentimentConfig(comment.sentiment).badgeClass}`}>
                  {comment.sentiment || 'neutral'}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div 
                      className="h-full" 
                      style={{ 
                        width: `${(comment.confidence || 0.5) * 100}%`,
                        backgroundColor: getSentimentConfig(comment.sentiment).color
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#aaaaaa]">
                    {Math.round((comment.confidence || 0.5) * 100)}%
                  </span>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  {comment.status === 'deleted' ? (
                    <><ShieldAlert size={12} className="text-red-500" /> <span className="text-red-500">Deleted</span></>
                  ) : comment.autoLiked ? (
                    <><ThumbsUp size={12} className="text-green-500" /> <span className="text-green-500">Auto-Liked</span></>
                  ) : (
                    <><Clock size={12} className="text-gray-400" /> <span className="text-gray-400">Pending</span></>
                  )}
                </div>
              </td>
              <td>
                <a 
                  href={`https://youtube.com/watch?v=${comment.videoId}`} 
                  target="_blank" 
                  className="flex items-center gap-1 text-[#3ea6ff] hover:underline"
                >
                  <ExternalLink size={12} />
                  <span className="text-[10px] font-bold">View</span>
                </a>
              </td>
              <td>
                <span className="text-[10px] font-bold text-[#666]">
                  {formatDistanceToNow(new Date(comment.publishedAt), { addSuffix: true })}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleAction(comment._id, 'like')}
                    className="p-2 hover:bg-green-500/10 text-[#aaaaaa] hover:text-green-500 rounded-lg transition-all"
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <button 
                    onClick={() => handleAction(comment._id, 'delete')}
                    className="p-2 hover:bg-red-500/10 text-[#aaaaaa] hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-white/5 text-[#aaaaaa] rounded-lg">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModerationTable;
