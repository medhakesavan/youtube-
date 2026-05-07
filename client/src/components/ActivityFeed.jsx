import React from 'react';
import { 
  Zap, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSentimentConfig } from '../constants/sentimentColors';

const ActivityFeed = ({ activities }) => {
  return (
    <div className="w-[320px] bg-[#1e1e1e] border-l border-[#2a2a2a] flex flex-col hidden 2xl:flex shadow-[-10px_0_30px_rgba(0,0,0,0.3)]">
      <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-widest text-[#aaaaaa]">Live Activity</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
          <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <AnimatePresence initial={false}>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#2a2a2a] p-4 rounded-2xl border border-white/5 relative group hover:border-white/10 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5" style={{ 
                  color: getSentimentConfig(activity.status === 'deleted' ? 'toxic' : (activity.autoLiked ? 'positive' : 'neutral')).color 
                }}>
                  {activity.status === 'deleted' ? <Trash2 size={16} /> : 
                   activity.autoLiked ? <Zap size={16} /> : <MessageSquare size={16} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white mb-1">
                    {activity.status === 'deleted' ? 'Comment Deleted' : 
                     activity.autoLiked ? 'Comment Auto-Liked' : 'New Comment Detected'}
                  </p>
                  <p className="text-[11px] text-[#aaaaaa] line-clamp-2 italic leading-tight">
                    "{activity.text}"
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-bold text-[#666] flex items-center gap-1">
                      <Clock size={10} /> Just now
                    </span>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">@{activity.author}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {activities.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                <ShieldAlert size={48} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Awaiting activity...</p>
             </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-[#2a2a2a]/50 border-t border-[#2a2a2a]">
        <button className="w-full py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
          Pause Feed
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
