import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Bell, 
  Settings, 
  Search, 
  ChevronDown,
  CheckCircle2, 
  AlertCircle,
  Activity
} from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState('checking');

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/chat':
        return 'FlowMind Workspace | Goal: Launch Q3 Campaign';
      case '/tasks':
        return 'Task Matrix Hub';
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

  return (
    <header className="h-16 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-6 z-30 shrink-0">
      {/* Title */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm md:text-base font-bold text-white tracking-tight leading-none m-0">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4.5">
        {/* API Health badge (compact) */}
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

        {/* Search Bar (Glassmorphic) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs">
          <Search size={13} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, goals..."
            className="bg-transparent border-none outline-none text-white text-xs w-36 placeholder-slate-500"
          />
        </div>

        {/* Settings Button */}
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <Settings size={15} />
        </button>

        {/* Notifications Icon */}
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
          <Bell size={15} />
          <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        {/* User Card Avatar */}
        <div className="flex items-center gap-2.5 pl-2.5 border-l border-white/5 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            AC
          </div>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Alex Chen</span>
            <ChevronDown size={11} className="text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
