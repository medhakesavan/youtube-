import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboardIcon, 
  MessageSquareIcon, 
  ShieldAlertIcon, 
  SettingsIcon, 
  YoutubeIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon
} from 'lucide-react';
import StatsGrid from './components/StatsGrid';
import ModerationQueue from './components/ModerationQueue';
import Sidebar from './components/Sidebar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/comments`, { params: filters });
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              {activeTab === 'dashboard' ? 'Analytics Overview' : 'Moderation Queue'}
            </h1>
            <p className="text-slate-400 mt-1">
              AI-powered comment moderation for your YouTube channel.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => window.open('http://localhost:5000/auth', '_blank')}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <YoutubeIcon size={20} />
              Connect Channel
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <StatsGrid comments={comments} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3Icon className="text-indigo-400" />
                  Sentiment Distribution
                </h3>
                {/* Chart will go here */}
                <div className="h-64 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                  Charts integration ready
                </div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ClockIcon className="text-cyan-400" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {comments.slice(0, 5).map(c => (
                    <div key={c._id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
                      <img src={c.authorProfileImageUrl} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{c.author}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{c.text}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' : 
                        c.sentiment === 'toxic' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {c.sentiment}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ModerationQueue comments={comments} fetchComments={fetchComments} loading={loading} />
        )}
      </main>
    </div>
  );
}

export default App;
