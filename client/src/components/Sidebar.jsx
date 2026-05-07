import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  PlaySquare, 
  ShieldCheck, 
  Settings,
  LogOut,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'channels', label: 'Channels', icon: PlaySquare },
    { id: 'moderation', label: 'Moderation', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          width: isOpen ? 240 : 72,
          x: 0 
        }}
        className={`fixed lg:relative h-full bg-white border-r border-[#f0f0f0] flex flex-col z-[120] lg:z-[90] shadow-xl lg:shadow-none transition-all duration-300 ease-in-out ${
          !isOpen ? 'hidden lg:flex' : 'flex'
        }`}
        style={{
          left: 0,
          position: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'fixed' : 'relative'
        }}
      >
        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`sidebar-item mx-2 transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-[#fff1f0] text-[#ff0000] font-bold' 
                      : 'hover:bg-[#f9f9f9] text-[#606060]'
                  } ${isOpen ? 'w-[calc(100%-16px)] px-4 justify-start' : 'w-12 h-12 p-0 justify-center rounded-xl mx-auto'}`}
                >
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <item.icon 
                      size={20} 
                      strokeWidth={activeTab === item.id ? 2.5 : 2} 
                      className={activeTab === item.id ? 'text-[#ff0000]' : ''}
                    />
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-4 whitespace-nowrap overflow-hidden text-[14px] tracking-tight"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {activeTab === item.id && (
                    <div className="absolute left-0 w-1 h-6 bg-[#ff0000] rounded-r-full" />
                  )}
                </button>

                {/* Tooltip for Collapsed State */}
                {!isOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-[#282828] text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200] translate-x-2 group-hover:translate-x-0 transition-transform">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer Section: AI Status & Logout */}
        <div className={`p-4 mt-auto border-t border-[#f0f0f0] transition-all duration-300 ${isOpen ? 'space-y-4' : 'space-y-2'}`}>
          {/* AI Status Card */}
          <div className={`bg-[#fcfcfc] border border-[#f0f0f0] rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'p-4' : 'p-2'}`}>
            <div className={`flex items-center ${isOpen ? 'gap-3 mb-2' : 'justify-center'}`}>
              <div className={`rounded-xl bg-[#fff1f0] flex items-center justify-center text-[#ff0000] flex-shrink-0 ${isOpen ? 'w-8 h-8' : 'w-8 h-8'}`}>
                <Zap size={16} fill="currentColor" />
              </div>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-[11px] font-bold text-[#909090] uppercase tracking-wider leading-none">AI Status</p>
                  <p className="text-[13px] font-bold text-[#0f0f0f] mt-1">Live</p>
                </motion.div>
              )}
            </div>
            {isOpen && (
              <div className="w-full h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div className="h-full bg-[#ff0000] w-[85%] animate-pulse"></div>
              </div>
            )}
          </div>

          <button 
            onClick={onLogout}
            className={`sidebar-item group !text-[#d93025] hover:!bg-[#fce8e6] transition-all duration-200 ${
              isOpen ? 'w-full px-4' : 'w-12 h-12 p-0 justify-center rounded-xl mx-auto'
            }`}
          >
            <div className="flex-shrink-0 flex items-center justify-center">
              <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            </div>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-4 font-bold"
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
