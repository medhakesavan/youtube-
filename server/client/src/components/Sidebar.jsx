import React from 'react';
import { 
  LayoutDashboardIcon, 
  MessageSquareIcon, 
  ShieldAlertIcon, 
  SettingsIcon,
  ShieldCheckIcon
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
    { id: 'channels', label: 'Channels', icon: ShieldCheckIcon },
    { id: 'moderation', label: 'Moderation', icon: ShieldAlertIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl">
          <ShieldCheckIcon className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">youtubeAI</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 p-4 rounded-xl">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Bot Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-300">Live & Scanning</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
