import React, { useState } from 'react';
import { 
  Youtube, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Globe,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError('');
      try {
        await login(email, password);
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 relative font-['Inter']">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#ff0000]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#065fd4]/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[24px] p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] relative">
          {/* Top Logo Container */}
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 bg-[#ff0000] flex items-center justify-center rounded-[20px] mb-6 shadow-[0_12px_24px_-8px_rgba(255,0,0,0.3)] relative group"
            >
              <Youtube className="text-white fill-current group-hover:scale-110 transition-transform" size={32} />
            </motion.div>
            <h1 className="text-[28px] font-black text-[#0f0f0f] leading-tight mb-2 tracking-tighter">Welcome Back</h1>
            <p className="text-[#606060] text-[14px] font-medium">Sign in to your AI moderation centre.</p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 bg-[#fce8e6] border border-[#f5c6cb] rounded-xl flex items-center gap-3 text-[#d93025] text-[11px] font-bold"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-[#909090] uppercase tracking-widest ml-1">
                Corporate Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#909090] group-focus-within:text-[#ff0000] transition-colors">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e9ecef] text-[#0f0f0f] rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-[#ff0000]/50 focus:bg-white focus:ring-4 focus:ring-[#ff0000]/5 transition-all placeholder-[#adb5bd]"
                  placeholder="admin@youtubeai.test"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-[#909090] uppercase tracking-widest">
                  Secure Password
                </label>
                <button type="button" className="text-[10px] font-black text-[#065fd4] uppercase tracking-widest hover:underline">
                  Reset?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#909090] group-focus-within:text-[#ff0000] transition-colors">
                  <Lock size={16} />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e9ecef] text-[#0f0f0f] rounded-xl py-3 pl-12 pr-4 text-[14px] font-semibold focus:outline-none focus:border-[#ff0000]/50 focus:bg-white focus:ring-4 focus:ring-[#ff0000]/5 transition-all placeholder-[#adb5bd]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#0f0f0f] hover:bg-[#222222] disabled:bg-[#909090] text-white font-black py-3.5 rounded-xl shadow-[0_12px_24px_-8px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 text-[14px] mt-6 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Sign in to Dashboard
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Bottom Footer */}
          <div className="mt-8 text-center">
             <p className="text-[12px] font-bold text-[#909090]">
                Need a pro account?{' '}
                <button 
                  onClick={onSwitchToRegister}
                  className="text-[#ff0000] hover:underline"
                >
                  Create Now
                </button>
              </p>
          </div>
        </div>

        {/* Bottom Security Badges */}
        <div className="mt-12 flex flex-col items-center gap-5 opacity-60">
           <div className="flex items-center gap-8 text-[#909090] text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2"><ShieldCheck size={14}/> AES-256 Encryption</span>
              <span className="flex items-center gap-2"><Zap size={14}/> AI Core v4.2</span>
           </div>
           <p className="text-[10px] font-black text-[#adb5bd] uppercase tracking-[0.4em]">
             &copy; 2026 YouTube AI MOD &bull; Global Systems LLC
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
