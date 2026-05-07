import React from 'react';
import { 
  MessageSquare, 
  Smile, 
  ShieldAlert, 
  ThumbsUp,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

import { SENTIMENT_COLORS } from '../constants/sentimentColors';

const StatsGrid = ({ stats }) => {
  const cards = [
    { 
      label: 'Total Comments', 
      value: stats?.totalComments || 0, 
      icon: MessageSquare, 
      color: 'text-[#0f0f0f]', 
      iconColor: 'text-[#606060]',
      bgColor: 'bg-[#f8f8f8]',
      trend: '+12%',
      isUp: true
    },
    { 
      label: 'Positive', 
      value: stats?.categories?.find(c => c._id === 'positive')?.count || 0,
      icon: Smile, 
      color: SENTIMENT_COLORS.positive.iconColor, 
      iconColor: SENTIMENT_COLORS.positive.iconColor,
      bgColor: SENTIMENT_COLORS.positive.bgColor,
      trend: '+5%',
      isUp: true
    },
    { 
      label: 'Toxic Detected', 
      value: stats?.categories?.find(c => c._id === 'toxic')?.count || 0,
      icon: ShieldAlert, 
      color: SENTIMENT_COLORS.toxic.iconColor, 
      iconColor: SENTIMENT_COLORS.toxic.iconColor,
      bgColor: SENTIMENT_COLORS.toxic.bgColor,
      trend: '-18%',
      isUp: false
    },
    { 
      label: 'Auto-Deleted', 
      value: stats?.toxicDeleted || 0, 
      icon: ThumbsUp, 
      color: 'text-[#065fd4]', 
      iconColor: 'text-[#065fd4]',
      bgColor: 'bg-[#e3f2fd]',
      trend: '+24%',
      isUp: true
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="yt-card group">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${card.bgColor} ${card.iconColor} transition-transform group-hover:scale-110 duration-300`}>
              <card.icon size={24} />
            </div>
            <div className={`flex items-center gap-1 text-[12px] font-bold ${card.isUp ? 'text-[#2ba640]' : 'text-[#d93025]'} bg-white px-2 py-1 rounded-full shadow-sm border border-[#f0f0f0]`}>
              {card.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {card.trend}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-[#909090] uppercase tracking-wider">{card.label}</p>
            <h3 className={`text-3xl font-black ${card.color} tracking-tighter`}>
              {card.value.toLocaleString()}
            </h3>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#f8f8f8] flex items-center justify-between">
             <span className="text-[11px] font-medium text-[#aaaaaa]">vs last 30 days</span>
             <div className="flex -space-x-2">
                {[1,2,3].map(j => (
                  <div key={j} className="w-5 h-5 rounded-full border-2 border-white bg-[#f0f0f0]"></div>
                ))}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
