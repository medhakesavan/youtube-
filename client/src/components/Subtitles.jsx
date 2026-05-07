import React from 'react';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';

const Subtitles = () => {
  return (
    <div className="max-w-4xl mx-auto pt-10">
      <h2 className="text-2xl font-bold text-[#0f0f0f] mb-20">Video subtitles</h2>
      
      <div className="flex flex-col items-center">
        <div className="w-[340px] mb-8">
          <button className="w-full flex items-center justify-between px-4 py-3 border border-[#e5e5e5] rounded bg-white text-sm text-[#0f0f0f] hover:bg-[#f9f9f9]">
            <span className="text-[#606060]">Set language</span>
            <ChevronDownIcon size={20} className="text-[#606060]" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-10">
          <div className="w-5 h-5 border-2 border-[#0f0f0f] rounded flex items-center justify-center bg-[#0f0f0f]">
            <CheckIcon size={14} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-sm text-[#0f0f0f]">Make this the default for my channel</span>
        </div>

        <button className="bg-[#f2f2f2] text-[#909090] px-8 py-2 rounded-full font-bold text-sm cursor-not-allowed uppercase tracking-wider">
          Confirm
        </button>
      </div>
    </div>
  );
};

export default Subtitles;
