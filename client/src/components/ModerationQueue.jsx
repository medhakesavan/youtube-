import React, { useState, useEffect } from 'react';
import api from '../api';
import { io } from 'socket.io-client';
import { 
  ThumbsUp, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  ExternalLink,
  Loader2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getSentimentConfig } from '../constants/sentimentColors';

const ModerationQueue = ({ onAction, searchQuery }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ sentiment: '', status: '', note: '' });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComments();

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socket.on('stats_updated', fetchComments);
    socket.on('new_comment_analyzed', fetchComments);
    
    return () => socket.disconnect();
  }, [filter]);

  const fetchComments = async () => {
    try {
      const res = await api.get('/comments', {
        params: {
          sentiment: filter !== 'all' && ['positive', 'neutral', 'moderate', 'toxic'].includes(filter) ? filter : undefined,
          status: filter === 'deleted' ? 'deleted' : (filter === 'liked' ? undefined : undefined),
          autoLiked: filter === 'liked' ? true : undefined
        }
      });
      setComments(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.post(`/comments/${id}/action`, { action });
      fetchComments();
      if (onAction) onAction();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditForm({
      sentiment: comment.sentiment,
      status: comment.status,
      note: comment.note || ''
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/comments/${id}/edit`, editForm);
      setEditingId(null);
      fetchComments();
      if (onAction) onAction();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="animate-spin text-[#ff0000]" size={32} />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Bar */}
      <div className="flex items-center gap-2 p-4 bg-white border-b border-[#f0f0f0] overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-black uppercase text-[#909090] mr-2">Filter By:</span>
        {[
          { id: 'all', label: 'All Activity' },
          { id: 'toxic', label: 'Toxic' },
          { id: 'moderate', label: 'Moderate' },
          { id: 'positive', label: 'Positive' },
          { id: 'deleted', label: 'Auto-Deleted' },
          { id: 'liked', label: 'Auto-Liked' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setLoading(true); }}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
              filter === f.id 
                ? 'bg-[#0f0f0f] text-white border-[#0f0f0f] shadow-md' 
                : 'bg-[#f9f9f9] text-[#606060] border-[#e5e5e5] hover:bg-[#f0f0f0]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="w-full overflow-x-auto custom-scroll">
      <table className="modern-table">
        <thead>
          <tr>
            <th className="min-w-[300px]">User & Comment</th>
            <th>Sentiment</th>
            <th>Confidence</th>
            <th>Moderation Status</th>
            <th>Video</th>
            <th>Time</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-12 text-[#909090] font-medium italic">
                No moderation logs found.
              </td>
            </tr>
          ) : (
            comments
              .filter(c => c.text.toLowerCase().includes((searchQuery || '').toLowerCase()) || c.author.toLowerCase().includes((searchQuery || '').toLowerCase()))
              .map((comment) => (
              <tr key={comment._id} className={`group transition-colors ${editingId === comment._id ? 'bg-[#fef2f2]/50' : ''}`}>
                <td>
                  <div className="flex items-start gap-4">
                    <img 
                      src={comment.authorProfileImageUrl || `https://ui-avatars.com/api/?name=${comment.author}&background=f0f0f0&color=606060`} 
                      className="w-10 h-10 rounded-full border border-[#f0f0f0] flex-shrink-0" 
                      alt=""
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-[#0f0f0f]">@{comment.author}</p>
                      <p className="text-[12px] text-[#222] mt-1 leading-relaxed">{comment.text}</p>
                      {comment.note && (
                        <p className="text-[10px] font-bold text-[#065fd4] mt-1 flex items-center gap-1">
                          <Edit3 size={10} /> Note: {comment.note}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  {editingId === comment._id ? (
                    <select 
                      value={editForm.sentiment}
                      onChange={(e) => setEditForm({...editForm, sentiment: e.target.value})}
                      className="text-[11px] font-bold border rounded-lg px-2 py-1"
                    >
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="moderate">Moderate</option>
                      <option value="toxic">Toxic</option>
                    </select>
                  ) : (
                    <span className={`yt-badge ${getSentimentConfig(comment.sentiment).badgeClass}`}>
                      {comment.sentiment}
                    </span>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div 
                        className="h-full" 
                        style={{ 
                          width: `${(comment.confidence || 0.5) * 100}%`,
                          backgroundColor: getSentimentConfig(comment.sentiment).color
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#606060]">
                      {Math.round((comment.confidence || 0) * 100)}%
                    </span>
                  </div>
                </td>
                <td>
                  {editingId === comment._id ? (
                    <select 
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="text-[11px] font-bold border rounded-lg px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="flagged">Flagged</option>
                      <option value="deleted">Deleted</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight">
                      {comment.status === 'deleted' ? (
                        <><ShieldAlert size={14} className="text-[#d93025]" /> <span className="text-[#d93025]">Deleted</span></>
                      ) : comment.status === 'approved' ? (
                        <><CheckCircle2 size={14} className="text-[#2ba640]" /> <span className="text-[#2ba640]">Approved</span></>
                      ) : comment.status === 'flagged' ? (
                        <><AlertTriangle size={14} className="text-[#f9ab00]" /> <span className="text-[#f9ab00]">Review Req</span></>
                      ) : (
                        <><Clock size={14} className="text-[#909090]" /> <span className="text-[#909090]">Queued</span></>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  <a href={`https://youtube.com/watch?v=${comment.videoId}`} target="_blank" className="p-2 hover:bg-[#f0f0f0] rounded-lg inline-block transition-colors">
                    <ExternalLink size={14} className="text-[#065fd4]" />
                  </a>
                </td>
                <td>
                  <span className="text-[11px] font-bold text-[#909090]">
                    {formatDistanceToNow(new Date(comment.publishedAt))}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    {editingId === comment._id ? (
                      <>
                        <button onClick={() => saveEdit(comment._id)} className="p-2 bg-[#2ba640] text-white rounded-lg hover:bg-[#137333]"><CheckCircle2 size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-[#f0f0f0] text-[#606060] rounded-lg"><XCircle size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleAction(comment._id, 'approve')} className="p-2 hover:bg-[#e6f4ea] text-[#606060] hover:text-[#137333] rounded-lg border border-[#f0f0f0]" title="Approve & Publish"><ThumbsUp size={16} /></button>
                        <button onClick={() => handleAction(comment._id, 'hide')} className="p-2 hover:bg-[#fff8e1] text-[#606060] hover:text-[#f9ab00] rounded-lg border border-[#f0f0f0]" title="Hide/Hold for Review"><ShieldAlert size={16} /></button>
                        <button onClick={() => startEdit(comment)} className="p-2 hover:bg-[#f0f0f0] text-[#606060] rounded-lg border border-[#f0f0f0]" title="Edit Details"><Edit3 size={16} /></button>
                        <button onClick={() => handleAction(comment._id, 'delete')} className="p-2 hover:bg-[#fce8e6] text-[#606060] hover:text-[#c5221f] rounded-lg border border-[#f0f0f0]" title="Permanently Delete"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                  {editingId === comment._id && (
                    <div className="mt-2">
                      <input 
                        type="text" 
                        placeholder="Add note..."
                        value={editForm.note}
                        onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                        className="text-[10px] w-full border rounded p-1"
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default ModerationQueue;
