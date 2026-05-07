import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Zap, 
  Globe, 
  Bell, 
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Sliders
} from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const [autoMod, setAutoMod] = useState(true);
  const [threshold, setThreshold] = useState(85);
  const [languages, setLanguages] = useState(['English', 'Tamil', 'Tanglish']);

  const settingsGroups = [
    {
      title: 'Moderation Engine',
      icon: Shield,
      items: [
        { 
          label: 'Automatic Moderation', 
          desc: 'Automatically delete toxic comments without manual approval.',
          type: 'toggle',
          value: autoMod,
          onChange: () => setAutoMod(!autoMod)
        },
        { 
          label: 'Confidence Threshold', 
          desc: 'Minimum AI confidence required for automatic actions.',
          type: 'slider',
          value: threshold,
          onChange: (e) => setThreshold(e.target.value)
        }
      ]
    },
    {
      title: 'Language Support',
      icon: Globe,
      items: [
        { 
          label: 'Detection Languages', 
          desc: 'Languages the AI engine will actively monitor and analyze.',
          type: 'tags',
          value: languages
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { 
          label: 'Real-time Alerts', 
          desc: 'Receive browser notifications for high-toxicity detections.',
          type: 'toggle',
          value: true
        }
      ]
    }
  ];

  return (
    <div className="max-w-[1000px] mx-auto py-4 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#0f0f0f] tracking-tighter flex items-center gap-3">
          <div className="bg-[#f2f2f2] p-2 rounded-xl">
            <SettingsIcon size={24} />
          </div>
          System Settings
        </h1>
        <p className="text-[#606060] font-medium mt-2">Configure your AI moderation engine and dashboard preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {settingsGroups.map((group, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="yt-card overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f8f8f8]">
              <div className="p-2 bg-[#fff1f0] text-[#ff0000] rounded-lg">
                <group.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#0f0f0f]">{group.title}</h3>
            </div>

            <div className="space-y-8">
              {group.items.map((item, j) => (
                <div key={j} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-[500px]">
                    <p className="text-[15px] font-bold text-[#0f0f0f]">{item.label}</p>
                    <p className="text-[13px] text-[#909090] font-medium mt-0.5">{item.desc}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {item.type === 'toggle' && (
                      <button 
                        onClick={item.onChange}
                        className={`transition-colors duration-300 ${item.value ? 'text-[#ff0000]' : 'text-[#cccccc]'}`}
                      >
                        {item.value ? <ToggleRight size={44} strokeWidth={1.5} /> : <ToggleLeft size={44} strokeWidth={1.5} />}
                      </button>
                    )}
                    
                    {item.type === 'slider' && (
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <input 
                          type="range" 
                          min="50" 
                          max="99" 
                          value={item.value} 
                          onChange={item.onChange}
                          className="flex-1 accent-[#ff0000]"
                        />
                        <span className="text-sm font-black text-[#ff0000] bg-[#fff1f0] px-3 py-1 rounded-full min-w-[50px] text-center">
                          {item.value}%
                        </span>
                      </div>
                    )}

                    {item.type === 'tags' && (
                      <div className="flex flex-wrap gap-2">
                        {item.value.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-[#f2f2f2] text-[#0f0f0f] text-[12px] font-bold rounded-full border border-[#e5e5e5]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#f0f0f0]">
        <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#606060] hover:bg-[#f2f2f2] transition-colors">
          Discard Changes
        </button>
        <button className="yt-btn-primary">
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default Settings;
