import React from 'react';
import { 
  MessageSquareIcon, 
  SmileIcon, 
  AlertTriangleIcon, 
  Trash2Icon,
  TrendingUpIcon
} from 'lucide-react';

const StatsGrid = ({ comments }) => {
  const stats = [
    { 
      label: 'Total Comments', 
      value: comments.length, 
      icon: MessageSquareIcon, 
      color: 'text-indigo-400', 
      bg: 'bg-indigo-400/10' 
    },
    { 
      label: 'Positive', 
      value: comments.filter(c => c.sentiment === 'positive').length, 
      icon: SmileIcon, 
      color: 'text-green-400', 
      bg: 'bg-green-400/10' 
    },
    { 
      label: 'Toxic / Flagged', 
      value: comments.filter(c => c.sentiment === 'toxic').length, 
      icon: AlertTriangleIcon, 
      color: 'text-red-400', 
      bg: 'bg-red-400/10' 
    },
    { 
      label: 'Auto-Liked', 
      value: comments.filter(c => c.aiActionTaken).length, 
      icon: TrendingUpIcon, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-400/10' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
            </div>
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={stat.color} size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
