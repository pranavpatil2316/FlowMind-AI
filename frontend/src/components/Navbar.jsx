import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Activity
} from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'active' | 'demo' | 'error'
  const [time, setTime] = useState(new Date());

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Overview';
      case '/chat':
        return 'AI Workspace';
      case '/tasks':
        return 'Task Matrix';
      case '/planner':
        return 'Daily Schedule';
      case '/email':
        return 'Smart Outreach';
      case '/summarize':
        return 'Document Intelligence';
      default:
        return 'Workspace';
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
  }, [location.pathname]); // check health on navigation

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="h-16 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-6 z-30">
      {/* Title */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-white tracking-tight m-0">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right side info bar */}
      <div className="flex items-center gap-4">
        {/* Date and Time (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 text-xs font-medium">
          <CalendarIcon size={13} className="text-cyan-400" />
          <span>{formattedDate}</span>
          <span className="text-white/20">|</span>
          <span>{formattedTime}</span>
        </div>

        {/* Gemini connection status */}
        <div className="flex items-center">
          {apiStatus === 'checking' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 text-xs">
              <Activity size={13} className="animate-spin text-slate-400" />
              <span>Verifying AI...</span>
            </div>
          )}
          {apiStatus === 'active' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="hidden sm:inline">Gemini AI Active</span>
              <span className="sm:hidden">Gemini OK</span>
            </div>
          )}
          {apiStatus === 'demo' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold">
              <AlertCircle size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Running in Demo Mode</span>
              <span className="sm:hidden">Demo Mode</span>
            </div>
          )}
          {apiStatus === 'error' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              <AlertCircle size={13} className="text-rose-400" />
              <span>Backend Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
