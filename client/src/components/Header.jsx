import React from 'react';
import { 
  Search, 
  Mic, 
  Video, 
  Bell, 
  Menu,
  Youtube
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleSidebar, onSearch }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) onSearch(value);
  };

  const handleMicClick = () => alert('Voice search is not enabled in this version.');
  const handleVideoClick = () => alert('Live Stream / Upload monitoring features coming soon!');
  const handleNotificationClick = () => alert('No new notifications. Your channel is being moderated in real-time.');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of YouTube AI Studio?')) {
      logout();
    }
  };

  return (
    <header className="h-[64px] bg-white border-b border-[#f0f0f0] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-[100] shadow-sm">
      {/* Left Section: Logo & Menu */}
      <div className="flex items-center gap-4 lg:w-[240px]">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors active:scale-90"
        >
          <Menu size={22} className="text-[#0f0f0f]" />
        </button>
        <div className="flex items-center group cursor-pointer select-none">
          <div className="text-[#ff0000] transition-transform group-hover:scale-105 duration-200 flex items-center">
            <Youtube size={28} fill="currentColor" />
          </div>
          <div className="flex items-baseline ml-1">
            <span className="text-[19px] font-bold tracking-tighter text-[#0f0f0f] leading-none" style={{ fontFamily: '"Roboto", "Arial", sans-serif' }}>
              YouTube
            </span>
            <span className="ml-1 text-[13px] font-normal text-[#606060] tracking-tight leading-none">
              AI Mod
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Search Bar */}
      <div className="flex-1 max-w-[720px] px-4 hidden md:flex items-center gap-3">
        <form className="relative flex-1 group" onSubmit={(e) => e.preventDefault()}>
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#909090] pointer-events-none group-focus-within:text-[#ff0000]">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search comments or videos..." 
            className="w-full bg-[#f8f8f8] border border-[#e5e5e5] rounded-full py-2.5 pl-12 pr-6 text-[14px] font-medium focus:outline-none focus:border-[#ff0000] focus:bg-white focus:shadow-md transition-all placeholder-[#888]"
          />
        </form>
        <button 
          onClick={handleMicClick}
          className="p-2.5 bg-[#f8f8f8] hover:bg-[#f2f2f2] rounded-full border border-[#e5e5e5] transition-colors shadow-sm active:scale-95"
        >
          <Mic size={18} className="text-[#0f0f0f]" />
        </button>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-2 lg:gap-4 lg:w-[240px] justify-end">
        <button 
          onClick={handleVideoClick}
          className="p-2 hover:bg-[#f2f2f2] rounded-full text-[#0f0f0f] hidden lg:block transition-all active:scale-95" 
          title="Create"
        >
          <Video size={20} />
        </button>
        <button 
          onClick={handleNotificationClick}
          className="p-2 hover:bg-[#f2f2f2] rounded-full text-[#0f0f0f] transition-all active:scale-95" 
          title="Notifications"
        >
          <div className="relative">
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff0000] rounded-full border-2 border-white"></span>
          </div>
        </button>
        
        {/* Profile Chip */}
        <div className="flex items-center gap-2.5 pl-2 ml-2 border-l border-[#f0f0f0]">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[13px] font-bold text-[#0f0f0f] leading-none">{user?.name || 'Admin User'}</span>
            <span className="text-[10px] font-bold text-[#2ba640] uppercase tracking-wider mt-1">Live Mode</span>
          </div>
          <div 
            onClick={handleLogout}
            className="relative group cursor-pointer"
            title="Account Settings / Logout"
          >
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff0000] to-[#ff6b6b] flex items-center justify-center text-white font-bold border-2 border-white shadow-sm overflow-hidden transition-transform group-hover:scale-105 active:scale-95">
                {user?.name?.charAt(0) || 'A'}
             </div>
             <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#2ba640] rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
