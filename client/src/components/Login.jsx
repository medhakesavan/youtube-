import React, { useState } from 'react';
import { ShieldCheckIcon, MailIcon, LockIcon, ArrowRightIcon, YoutubeIcon } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, we simulate a successful login
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <ShieldCheckIcon className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Welcome to youtubeAI</h2>
          <p className="text-slate-400 text-center">Sign in to manage your YouTube comment moderation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MailIcon size={18} className="text-slate-500" />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="admin@youtubeai.test"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockIcon size={18} className="text-slate-500" />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            Sign In
            <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Or continue with</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => window.location.href = 'http://localhost:5000/auth'}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <YoutubeIcon className="text-red-500" size={20} />
            Connect YouTube Channel
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-slate-500 z-10">
        &copy; {new Date().getFullYear()} youtubeAI. All rights reserved.
      </p>
    </div>
  );
};

export default Login;
