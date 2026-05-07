import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AnalyticsCard = ({ title, value, icon: Icon, color = "text-[#aaaaaa]", trend }) => {
  const isPositive = trend?.startsWith('+');

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#2a2a2a] shadow-lg relative overflow-hidden group hover:border-[#333] transition-all"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-xl bg-white/5 ${color} border border-white/5`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-[0.15em] mb-1">{title}</h3>
        <p className="text-3xl font-black tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>

      <div className="mt-4 w-full h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '70%' }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;
