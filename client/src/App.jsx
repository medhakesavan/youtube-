import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from './api';
import { io } from 'socket.io-client';
import { 
  MessageSquare, 
  ShieldCheck, 
  BarChart3, 
  Loader2,
  AlertTriangle,
  PlaySquare,
  Zap,
  TrendingUp,
  Clock,
  ThumbsUp,
  Trash2,
  Activity
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { SENTIMENT_COLORS, SENTIMENT_ORDER, getSentimentConfig } from './constants/sentimentColors';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StatsGrid from './components/StatsGrid';
import ModerationQueue from './components/ModerationQueue';
import VideosList from './components/VideosList';
import Settings from './components/Settings';
import Login from './components/Login';

const App = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      fetchChannels();
      
      const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
      
      socket.on('live_activity', (activity) => {
        setActivities(prev => [{ ...activity, id: Date.now() }, ...prev].slice(0, 5));
      });

      socket.on('stats_updated', () => {
        fetchAnalytics();
      });

      socket.on('new_comment_analyzed', () => {
        fetchAnalytics();
      });
      
      return () => socket.disconnect();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setStats(res.data);
    } catch (err) {
      console.error('Fetch Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await api.get('/youtube/channels');
      setChannels(res.data);
    } catch (err) {
      console.error('Fetch Channels Error:', err);
    }
  };

  if (authLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f9f9f9]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#ff0000]" size={48} />
        <p className="text-[14px] font-bold text-[#606060] uppercase tracking-widest">Initialising Studio...</p>
      </div>
    </div>
  );

  if (!user) return <Login />;

  const sentimentData = SENTIMENT_ORDER.map(sentimentKey => {
    const cat = stats?.categories?.find(c => c._id === sentimentKey);
    const config = SENTIMENT_COLORS[sentimentKey];
    return {
      name: config.label,
      key: sentimentKey,
      value: cat?.count || 0,
      color: config.color
    };
  }).filter(data => data.value > 0);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f9f9f9]">
      <Header toggleSidebar={toggleSidebar} onSearch={setSearchQuery} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={logout} 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        
        <main className={`flex-1 overflow-y-auto custom-scroll p-6 lg:p-8 transition-all duration-300 ease-in-out`}>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-[1440px] mx-auto space-y-8"
              >
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl font-black text-[#0f0f0f] tracking-tighter">Channel Dashboard</h1>
                    <p className="text-[13px] text-[#606060] font-medium">Monitoring your audience engagement in real-time.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
                      <Clock size={14} className="text-[#909090]" />
                      <span className="text-[12px] font-bold text-[#0f0f0f]">Last 30 Days</span>
                    </div>
                    <button className="yt-btn-primary !py-1.5 !px-4 !text-xs">
                      <Zap size={14} fill="currentColor" />
                      Live Analysis
                    </button>
                  </div>
                </div>

                {/* Main Stats Grid */}
                <StatsGrid stats={stats} />

                {/* Charts & Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sentiment Distribution */}
                  <div className="yt-card lg:col-span-2 !p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-bold text-[#0f0f0f]">Sentiment Distribution</h3>
                        <p className="text-[11px] text-[#909090] font-medium">Emotional engagement overview</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {sentimentData.map((entry) => (
                          <div key={entry.key} className="flex items-center gap-1 px-1.5 py-0.5 bg-[#f9f9f9] rounded-md border border-[#f0f0f0]">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-[9px] font-bold text-[#606060] uppercase">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="h-[250px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sentimentData.length > 0 ? sentimentData : [{name: 'Empty', value: 1}]}
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={100}
                            paddingAngle={8}
                            cornerRadius={6}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1200}
                            stroke="none"
                          >
                            {sentimentData.map((entry) => (
                              <Cell 
                                key={`cell-${entry.key}`} 
                                fill={entry.color}
                                className="focus:outline-none"
                              />
                            ))}
                            {sentimentData.length === 0 && <Cell fill="#f2f2f2" />}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '16px', 
                              border: 'none', 
                              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                              padding: '12px 16px'
                            }}
                            itemStyle={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}
                            cursor={{ fill: 'transparent' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-black text-[#0f0f0f] tracking-tighter leading-none">{stats?.totalComments || 0}</span>
                        <span className="text-[10px] font-bold text-[#909090] uppercase tracking-widest mt-1.5">Comments</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Moderation Feed */}
                  <div className="yt-card !p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="text-[#2ba640]" size={18} />
                        <h3 className="text-base font-bold text-[#0f0f0f]">Live Feed</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#ff0000] animate-pulse"></div>
                        <span className="text-[10px] font-black text-[#ff0000] uppercase tracking-tighter">Live</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 min-h-[200px]">
                      {activities.filter(a => a.text.toLowerCase().includes(searchQuery.toLowerCase()) || a.author?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8">
                          <Activity size={32} className="mb-2" />
                          <p className="text-[11px] font-bold">No matching activities...</p>
                        </div>
                      ) : (
                        activities
                          .filter(a => a.text.toLowerCase().includes(searchQuery.toLowerCase()) || a.author?.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(activity => (
                          <motion.div 
                            key={activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 bg-[#f8f8f8] border border-[#f0f0f0] rounded-xl"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {activity.type === 'delete' ? (
                                  <Trash2 size={12} className="text-[#d93025]" />
                                ) : (
                                  <ThumbsUp size={12} className="text-[#065fd4]" />
                                )}
                                <span className="text-[10px] font-black text-[#0f0f0f] uppercase">
                                  {activity.type === 'delete' ? 'Auto-Deleted' : 'Auto-Liked'}
                                </span>
                              </div>
                              <span className="text-[9px] font-bold text-[#606060] bg-white px-2 py-0.5 rounded-full border border-[#f0f0f0]">
                                {Math.round(activity.confidence * 100)}%
                              </span>
                            </div>
                            <p className="text-[11px] text-[#606060] line-clamp-1 italic">"{activity.text}"</p>
                          </motion.div>
                        ))
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-[#fff8e1] border border-[#ffe082] rounded-xl flex items-start gap-3">
                      <div className="bg-[#f9ab00] p-1.5 rounded-lg text-white flex-shrink-0">
                        <AlertTriangle size={14} />
                      </div>
                      <p className="text-[10px] font-medium text-[#795548] leading-tight">
                        <b>AI Status:</b> Monitoring English, Tamil & Tanglish comments. {stats?.pendingModeration || 0} flagged for review.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div 
                key="videos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <VideosList channelId={channels[0]?.channelId} onAction={fetchAnalytics} searchQuery={searchQuery} />
              </motion.div>
            )}

            {activeTab === 'channels' && (
              <motion.div 
                key="channels"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1200px] mx-auto space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-black text-[#0f0f0f] tracking-tighter">Connected Channels</h1>
                    <p className="text-[#606060] font-medium mt-1">Manage your linked YouTube accounts and moderation settings.</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '/auth')}
                    className="yt-btn-primary"
                  >
                    <PlaySquare size={18} fill="currentColor" />
                    Add Channel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {channels.map((channel) => (
                    <div key={channel.channelId} className="yt-card group hover:border-[#ff0000]/30 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#f9f9f9] border border-[#f0f0f0] overflow-hidden flex-shrink-0">
                          <img src={channel.thumbnail || `https://ui-avatars.com/api/?name=${channel.title}&background=f0f0f0`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-black text-[#0f0f0f] truncate">{channel.title}</h3>
                          <p className="text-[12px] font-bold text-[#909090] mt-0.5">ID: {channel.channelId.substring(0, 12)}...</p>
                          <div className="mt-4 flex items-center gap-3">
                             <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2ba640] bg-[#e6f4ea] px-2.5 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#2ba640] animate-pulse"></div>
                                Active
                             </div>
                             <span className="text-[11px] font-bold text-[#909090] uppercase tracking-widest">Scanning Live</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-5 border-t border-[#f8f8f8] flex items-center justify-between">
                         <button className="text-[13px] font-bold text-[#065fd4] hover:underline">Manage Settings</button>
                         <button className="text-[13px] font-bold text-[#909090] hover:text-[#d93025] transition-colors">Disconnect</button>
                      </div>
                    </div>
                  ))}

                  {/* Empty State / Add Card */}
                  <button 
                    onClick={() => window.location.href = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '/auth')}
                    className="yt-card border-dashed border-[#cccccc] flex flex-col items-center justify-center gap-4 text-[#909090] hover:text-[#0f0f0f] hover:border-[#909090] bg-[#fcfcfc]"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                      <PlaySquare size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-black">Link New Account</p>
                      <p className="text-[12px] font-medium mt-1">Connect another channel</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'moderation' && (
              <div className="space-y-6">
                 <h1 className="text-2xl font-bold text-[#0f0f0f]">Moderation Queue</h1>
                 <div className="yt-card !p-0 overflow-hidden">
                    <ModerationQueue onAction={fetchAnalytics} searchQuery={searchQuery} />
                 </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full"
              >
                <Settings />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
