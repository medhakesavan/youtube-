import React from 'react';
import { YoutubeIcon, CheckCircle2Icon } from 'lucide-react';

const ChannelSelector = ({ channels, onSelect, selectedId }) => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Select your Channel</h2>
        <p className="text-slate-400 mb-8">Choose which YouTube channel you want to moderate today.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div 
              key={channel.channelId}
              onClick={() => onSelect(channel.channelId)}
              className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer group ${
                selectedId === channel.channelId 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mb-4 overflow-hidden border-4 border-slate-800">
                  <YoutubeIcon size={40} className="text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-white mb-1">{channel.title}</h3>
                <p className="text-slate-500 text-sm">Channel ID: {channel.channelId.substring(0, 10)}...</p>
                
                {selectedId === channel.channelId && (
                  <div className="absolute top-4 right-4 text-indigo-400">
                    <CheckCircle2Icon size={24} />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => window.open('http://localhost:5000/auth', '_blank')}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-slate-500 transition-all text-slate-500 hover:text-slate-300"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2">
              <span className="text-2xl">+</span>
            </div>
            <span className="font-medium">Connect New Channel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelSelector;
