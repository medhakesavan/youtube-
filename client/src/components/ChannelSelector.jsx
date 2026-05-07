import React from 'react';
import { YoutubeIcon, CheckCircle2Icon } from 'lucide-react';

const ChannelSelector = ({ channels, onSelect, selectedId }) => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-[#0f0f0f] mb-2">Select your Channel</h2>
        <p className="text-[#606060] mb-8">Choose which YouTube channel you want to moderate today.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div 
              key={channel.channelId}
              onClick={() => onSelect(channel.channelId)}
              className={`relative p-6 rounded-xl border transition-all cursor-pointer group ${
                selectedId === channel.channelId 
                ? 'border-red-600 bg-[#fff5f5]' 
                : 'border-[#e5e5e5] bg-white hover:border-[#cccccc]'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#f9f9f9] flex items-center justify-center mb-4 overflow-hidden border-2 border-[#e5e5e5]">
                  <YoutubeIcon size={40} className="text-red-600" />
                </div>
                <h3 className="font-bold text-lg text-[#0f0f0f] mb-1">{channel.title}</h3>
                <p className="text-[#606060] text-sm">Channel ID: {channel.channelId.substring(0, 10)}...</p>
                
                {selectedId === channel.channelId && (
                  <div className="absolute top-4 right-4 text-red-600">
                    <CheckCircle2Icon size={24} />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => window.open((import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '/auth'), '_blank')}
            className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-[#e5e5e5] hover:border-[#cccccc] transition-all text-[#606060] hover:text-[#0f0f0f] bg-white"
          >
            <div className="w-12 h-12 rounded-full bg-[#f2f2f2] flex items-center justify-center mb-2">
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
