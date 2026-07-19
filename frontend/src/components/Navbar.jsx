import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Bell, 
  Settings, 
  Search, 
  ChevronDown,
  Activity,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import axios from 'axios';
import { useTasks } from '../context/TaskContext';

const Navbar = () => {
  const location = useLocation();
  const { 
    searchQuery, 
    setSearchQuery, 
    setShowSettingsModal, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    logout
  } = useTasks();

  const [apiStatus, setApiStatus] = useState('checking');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/chat':
        return 'FlowMind Workspace | Goal: Launch Q3 Campaign';
      case '/tasks':
        return 'Task Manager'; // Changed from Task Matrix Hub
      case '/planner':
        return 'Daily Availability Schedule';
      case '/email':
        return 'Smart Outreach Composer';
      case '/summarize':
        return 'Document Summarizer';
      default:
        return 'Workspace Controller';
    }
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('/api/health');
        if (response.data.gemini_api_configured) {
          setApiStatus('active');
        } else {
          setApiStatus('demo');
        }
      } catch (error) {
        setApiStatus('error');
      }
    };
    checkHealth();
  }, [location.pathname]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-6 z-30 shrink-0 relative">
      {/* Title */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm md:text-base font-bold text-white tracking-tight leading-none m-0">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4.5">
        
        {/* API Health badge */}
        <div className="hidden sm:flex items-center">
          {apiStatus === 'checking' && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Activity size={10} className="animate-spin" />
              <span>Verifying...</span>
            </div>
          )}
          {apiStatus === 'active' && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span>Gemini Active</span>
            </div>
          )}
          {apiStatus === 'demo' && (
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <span>Demo Mode</span>
            </div>
          )}
          {apiStatus === 'error' && (
            <div className="flex items-center gap-1 text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <span>Offline</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs">
          <Search size={13} className="text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent border-none outline-none text-white text-xs w-36 placeholder-slate-500"
          />
        </div>

        {/* Settings Button */}
        <button 
          onClick={() => setShowSettingsModal(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Workspace Settings"
        >
          <Settings size={15} />
        </button>

        {/* Notifications Icon with active dropdown wrapper */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all relative"
            aria-label="System Notifications"
            aria-haspopup="true"
            aria-expanded={showNotifDropdown}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2.5 w-72 glass-card rounded-2xl border border-white/10 p-3.5 shadow-2xl z-50 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-xs font-extrabold text-white">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllNotificationsRead}
                    className="text-[9px] text-purple-400 hover:text-white font-extrabold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-4">No notifications.</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl border text-[10px] font-semibold flex items-start gap-2.5 cursor-pointer transition-all ${
                        notif.read 
                          ? 'bg-transparent border-transparent text-slate-400' 
                          : 'bg-white/5 border-white/[0.03] text-white hover:border-purple-500/25'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                        notif.read ? 'bg-slate-700' : 'bg-purple-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="leading-snug text-left truncate">{notif.title}</p>
                        <span className="block text-[8px] text-slate-500 font-medium text-left mt-0.5">{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card Avatar dropdown (using Pranav Patil consistently) */}
        <div className="relative" ref={userRef}>
          <button 
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 pl-2.5 border-l border-white/5 cursor-pointer group bg-transparent border-t-0 border-r-0 border-b-0 border-l-0 outline-none"
            aria-label="User Profile Menu"
            aria-haspopup="true"
            aria-expanded={showUserDropdown}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              PP
            </div>
            <div className="hidden md:flex items-center gap-1">
              <span className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Pranav Patil</span>
              <ChevronDown size={11} className="text-slate-400" />
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2.5 w-48 glass-card rounded-2xl border border-white/10 p-2 shadow-2xl z-50 animate-fade-in text-left">
              <div className="px-3.5 py-2.5 border-b border-white/[0.04]">
                <span className="text-xs font-bold text-white block">Pranav Patil</span>
                <span className="text-[9px] text-slate-500 font-medium block truncate">pranav.patil@flowmind.ai</span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setShowSettingsModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <UserIcon size={13} />
                  <span>Profile & Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
