import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  YoutubeIcon, 
  ShieldCheckIcon, 
  BarChart3Icon,
  BellIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  Loader2Icon
} from 'lucide-react';
import StatsGrid from './components/StatsGrid';
import ModerationQueue from './components/ModerationQueue';
import Sidebar from './components/Sidebar';
import ChannelSelector from './components/ChannelSelector';
import Login from './components/Login';
import { Settings } from './components/AdminModules';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log("Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('error')) {
      alert("Authentication failed.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    fetchChannels();
  }, []);

  const disconnectChannel = async () => {
    if (!channels.length) return;
    try {
      await axios.post(`${API_BASE}/youtube/disconnect`, { channelId: channels[0].channelId });
      setChannels([]);
      setSelectedChannel(null);
    } catch (err) {
      console.error(err);
      alert("Failed to disconnect channel.");
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await axios.get(`${API_BASE}/youtube/channels`);
      setChannels(response.data);
      if (response.data.length > 0 && !selectedChannel) {
        setSelectedChannel(response.data[0].channelId);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  useEffect(() => {
    if (selectedChannel) {
      fetchComments();
    }
  }, [selectedChannel]);

  const fetchComments = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/comments`, { params: { ...filters, channelId: selectedChannel } });
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">
              {activeTab === 'dashboard' ? 'Dashboard' : 
               activeTab === 'channels' ? 'Channel Management' : 
               activeTab === 'moderation' ? 'Moderation Queue' : 'Analytics'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {channels.length > 0 ? (
              <div className="flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-sm">
                <img src={channels[0].thumbnailUrl || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full border border-slate-600" alt="Channel" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-tight">{channels[0].title}</span>
                  <span className="text-[10px] text-green-400 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircleIcon size={10} /> Connected
                  </span>
                </div>
                <button 
                  onClick={disconnectChannel} 
                  className="ml-2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                  title="Disconnect Channel"
                >
                  <XCircleIcon size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setIsConnecting(true);
                  window.location.href = 'http://localhost:5000/auth';
                }}
                disabled={isConnecting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                {isConnecting ? <Loader2Icon className="animate-spin" size={18} /> : <YoutubeIcon size={18} />}
                {isConnecting ? 'Connecting...' : 'Connect Channel'}
              </button>
            )}
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="relative">
              <button 
                onClick={() => setActiveTab('moderation')}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                title="Moderation Queue"
              >
                <BellIcon size={20} />
                {comments.filter(c => c.status === 'flagged').length > 0 && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </button>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => {
                  const menu = document.getElementById('profile-menu');
                  if (menu) menu.classList.toggle('hidden');
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                title="Profile Menu"
              >
                <UserCircleIcon size={24} />
              </button>
              
              <div id="profile-menu" className="hidden absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-slate-400 truncate">admin@youtubeai.test</p>
                </div>
                <button 
                  onClick={() => {
                    document.getElementById('profile-menu').classList.add('hidden');
                    setActiveTab('settings');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Settings
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('profile-menu').classList.add('hidden');
                    setIsAuthenticated(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-900/30">
          {activeTab === 'dashboard' && (
            <div className="p-8 max-w-7xl mx-auto space-y-12">
              <div className="pt-8">
                <header className="mb-10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">Live Monitoring</span>
                  </div>
                  <h2 className="text-4xl font-extrabold text-white mb-2">
                    YouTube Moderation Stats
                  </h2>
                  <p className="text-slate-400 text-lg">AI is currently scanning your comments for toxicity and spam.</p>
                </header>

                <StatsGrid comments={comments} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                  <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <BarChart3Icon className="text-indigo-400" size={24} />
                      Sentiment Distribution
                    </h3>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl">
                      <p className="text-slate-500 font-medium italic">Chart loading from database...</p>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-red-400">
                      <ShieldCheckIcon size={24} />
                      Auto-Moderation Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900/50 rounded-xl flex justify-between items-center border border-slate-800">
                        <span className="text-slate-400">Auto-Likes</span>
                        <span className="font-bold text-white text-lg">{comments.filter(c => c.aiActionTaken && c.sentiment === 'positive').length}</span>
                      </div>
                      <div className="p-4 bg-slate-900/50 rounded-xl flex justify-between items-center border border-slate-800">
                        <span className="text-slate-400">Auto-Deletes</span>
                        <span className="font-bold text-white text-lg">{comments.filter(c => c.status === 'deleted').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'channels' && (
            <ChannelSelector 
              channels={channels} 
              selectedId={selectedChannel}
              onSelect={(id) => {
                setSelectedChannel(id);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'moderation' && (
            <div className="p-8 max-w-7xl mx-auto">
              <ModerationQueue 
                comments={comments.filter(c => c.status === 'flagged')} 
                onAction={fetchComments}
              />
            </div>
          )}



          {activeTab === 'settings' && (
            <div className="p-8 max-w-7xl mx-auto">
              <Settings />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
