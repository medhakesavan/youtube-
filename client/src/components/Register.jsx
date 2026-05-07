import React, { useState } from 'react';
import { 
  Youtube, 
  Mail, 
  Lock, 
  User, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => onSwitchToLogin(), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col justify-center items-center p-6 relative overflow-hidden font-['Inter']">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-[32px] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="w-14 h-14 bg-red-600 flex items-center justify-center rounded-2xl mb-6 shadow-[0_0_20px_rgba(255,0,0,0.3)]"
            >
              <Youtube className="text-white fill-current" size={28} />
            </motion.div>
            <h2 className="text-2xl font-black text-white leading-tight mb-2 tracking-tighter">Create Creator Account</h2>
            <p className="text-[#aaaaaa] text-xs font-bold uppercase tracking-widest">Join the elite AI mod community</p>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 text-xs font-bold"
              >
                <CheckCircle2 size={18} />
                Account created! Redirecting to login...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-red-600">
                  <User size={18} className="text-[#444]" />
                </div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all placeholder-[#444]"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-red-600">
                  <Mail size={18} className="text-[#444]" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all placeholder-[#444]"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-red-600">
                    <Lock size={18} className="text-[#444]" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all placeholder-[#444]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Confirm</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-red-600">
                    <Lock size={18} className="text-[#444]" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all placeholder-[#444]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(220,38,38,0.2)] transition-all flex items-center justify-center gap-3 text-sm mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Link */}
          <div className="mt-10 flex flex-col items-center">
            <p className="text-xs font-bold text-[#aaaaaa]">
              Already a member?{' '}
              <button 
                onClick={onSwitchToLogin}
                className="text-red-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 text-[10px] font-black text-[#2a2a2a] uppercase tracking-[0.3em] z-10 flex items-center gap-2">
        <ShieldCheck size={12}/> AI SECURED PLATFORM
      </div>
    </div>
  );
};

export default Register;
