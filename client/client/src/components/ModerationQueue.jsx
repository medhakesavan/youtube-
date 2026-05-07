import React from 'react';
import axios from 'axios';
import { CheckCircle2Icon, XCircleIcon, ShieldAlertIcon, UserIcon, ExternalLinkIcon, MessageSquareIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const API_BASE = 'http://localhost:3001/api';

const ModerationQueue = ({ comments, fetchComments, loading }) => {
  
  const handleAction = async (id, action) => {
    try {
      await axios.post(`${API_BASE}/comments/${id}/action`, { action });
      fetchComments();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ShieldAlertIcon className="text-red-400" size={20} />
          Moderation Queue
        </h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium">All</button>
          <button className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-medium border border-red-500/20">Toxic</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Comment</th>
              <th className="px-6 py-4 font-semibold">Analysis</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {comments.map((comment) => (
              <tr key={comment._id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <img 
                      src={comment.authorProfileImageUrl || 'https://via.placeholder.com/40'} 
                      className="w-10 h-10 rounded-full border border-slate-700 flex-shrink-0"
                      alt="" 
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-100">{comment.author}</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {formatDistanceToNow(new Date(comment.publishedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed max-w-xl">{comment.text}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        comment.sentiment === 'toxic' ? 'bg-red-500' : 
                        comment.sentiment === 'positive' ? 'bg-green-500' : 'bg-slate-500'
                      }`}></div>
                      <span className="text-xs font-bold uppercase tracking-wider">{comment.sentiment}</span>
                    </div>
                    {comment.toxicityScore > 0 && (
                      <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500" 
                          style={{ width: `${comment.toxicityScore * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleAction(comment._id, 'approve')}
                      className="p-2 hover:bg-green-500/10 text-slate-400 hover:text-green-400 rounded-lg transition-colors border border-transparent hover:border-green-500/20"
                      title="Approve"
                    >
                      <CheckCircle2Icon size={20} />
                    </button>
                    <button 
                      onClick={() => handleAction(comment._id, 'delete')}
                      className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                      title="Delete"
                    >
                      <XCircleIcon size={20} />
                    </button>
                    <a 
                      href={`https://www.youtube.com/watch?v=${comment.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20"
                      title="View Video"
                    >
                      <ExternalLinkIcon size={20} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {comments.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-20 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-4">
                    <MessageSquareIcon size={48} className="opacity-20" />
                    <p>No comments in the queue.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModerationQueue;
