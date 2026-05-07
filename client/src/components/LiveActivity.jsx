import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ThumbsUp, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getSentimentConfig } from '../constants/sentimentColors';

const LiveActivity = ({ activities }) => {
  return (
    <div className="bg-yt-dark-grey rounded-2xl border border-yt-border overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-yt-border flex justify-between items-center bg-yt-light-grey/30">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <ShieldCheck className="text-yt-blue" size={20} />
          Live Activity Feed
        </h3>
        <span className="flex h-2 w-2 rounded-full bg-yt-red animate-pulse"></span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
        <AnimatePresence initial={false}>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <motion.div
                key={activity._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-4 p-3 rounded-xl hover:bg-yt-light-grey/50 transition-colors border border-transparent hover:border-yt-border group"
              >
                <div className="p-2.5 rounded-full h-fit mt-1" style={{ 
                  backgroundColor: `${getSentimentConfig(activity.status === 'deleted' ? 'toxic' : 'positive').color}20`,
                  color: getSentimentConfig(activity.status === 'deleted' ? 'toxic' : 'positive').color
                }}>
                  {activity.status === 'deleted' ? <Trash2 size={16} /> : <ThumbsUp size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-white truncate">{activity.author}</p>
                    <span className="text-[10px] text-yt-text-dim whitespace-nowrap">
                      {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-yt-text-dim line-clamp-2 italic mb-2">"{activity.text}"</p>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getSentimentConfig(activity.status === 'deleted' ? 'toxic' : 'positive').badgeClass}`}>
                      {activity.status === 'deleted' ? activity.sentiment || 'Toxic' : 'Auto-Liked'}
                    </span>
                    {activity.category && (
                      <span className="text-[10px] font-bold text-[#f9ab00] uppercase">
                        • {activity.category}
                      </span>
                    )}
                    {activity.confidence && (
                      <span className="text-[10px] text-yt-text-dim">
                        • {(activity.confidence * 100).toFixed(1)}% Confidence
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-yt-text-dim gap-3">
              <AlertCircle size={32} strokeWidth={1.5} />
              <p className="text-sm font-medium">No recent activity detected</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveActivity;
