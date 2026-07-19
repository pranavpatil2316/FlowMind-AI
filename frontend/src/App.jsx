import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import TaskManager from './components/TaskManager';
import DailyPlanner from './components/DailyPlanner';
import EmailGenerator from './components/EmailGenerator';
import PdfSummarizer from './components/PdfSummarizer';
import { TaskProvider } from './context/TaskContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('flowmind_logged_in') === 'true';
  });
  const [loadingApp, setLoadingApp] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    // Simulate initial workspace asset loading
    const timer = setTimeout(() => {
      setLoadingApp(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginLoading(true);
    // Simulate brief authentication response latency
    setTimeout(() => {
      setIsLoggedIn(true);
      sessionStorage.setItem('flowmind_logged_in', 'true');
      setLoginLoading(false);
    }, 1000);
  };

  // 1. Splash Loading View
  if (loadingApp) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-bg-dark bg-gradient-radial text-slate-100 relative">
        <div className="glow-orb w-[400px] h-[400px] bg-indigo-600/10 top-[20%] left-[30%] animate-float" />
        <div className="glow-orb w-[400px] h-[400px] bg-purple-600/10 bottom-[20%] right-[30%] animate-float-slow" />
        
        <div className="z-10 flex flex-col items-center text-center space-y-6">
          {/* Pulsing FM Logo */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-2xl shadow-indigo-500/40 animate-pulse-slow">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20V4h9M4 12h6" />
              <path d="M12 20V8l4 4 4-4v12" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              FlowMind AI
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">
              Configuring AI Workspace Assets...
            </p>
          </div>
          {/* Animated loading bar */}
          <div className="w-48 bg-slate-800/80 h-1 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full rounded-full animate-[loadingProgress_1.8s_ease-in-out_infinite]" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  // 2. Auth Gateway Login View
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-dark bg-gradient-radial text-slate-100 p-4 relative">
        <div className="glow-orb w-[500px] h-[500px] bg-indigo-600/8 top-[-50px] right-[-50px] animate-float" />
        <div className="glow-orb w-[500px] h-[500px] bg-purple-600/8 bottom-[-50px] left-[-50px] animate-float-slow" />

        <div className="w-full max-w-md glass-card p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center text-center space-y-6 z-10 animate-slide-up">
          {/* Brand Logo */}
          <div className="p-3.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-md">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20V4h9M4 12h6" />
              <path d="M12 20V8l4 4 4-4v12" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-none">
              Welcome to FlowMind AI
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              AI Productivity Assistant Workspace
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="w-full text-left space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                required
                defaultValue="pranav.patil@flowmind.ai"
                className="w-full px-3.5 py-2.5 text-xs md:text-sm glass-input"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workspace Key (Password)</label>
              <input
                type="password"
                required
                defaultValue="••••••••••••"
                className="w-full px-3.5 py-2.5 text-xs md:text-sm glass-input"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 active:scale-[0.98] disabled:from-indigo-600/40 disabled:to-purple-500/40 disabled:text-slate-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all mt-4"
            >
              {loginLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Access Workspace</span>
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-500 leading-normal max-w-[280px]">
            This is a mock SaaS gateway for hackathon demonstrations. Standard default credentials have been prefilled for you.
          </p>
        </div>
      </div>
    );
  }

  // 3. Authenticated App Layout
  return (
    <TaskProvider>
      <Router>
        <div className="flex h-screen w-screen overflow-hidden bg-bg-dark bg-gradient-radial text-slate-200 relative">
          
          {/* Ambient Background Glow Orbs */}
          <div className="glow-orb w-[500px] h-[500px] bg-indigo-600/8 top-[-100px] right-[-100px] animate-float" />
          <div className="glow-orb w-[600px] h-[600px] bg-purple-500/6 bottom-[-150px] left-[-150px] animate-float-slow" />
          <div className="glow-orb w-[450px] h-[450px] bg-blue-500/4 top-[35%] left-[40%] animate-float" style={{ animationDelay: '-4s' }} />

          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden z-10">
            
            {/* Navbar */}
            <Navbar />

            {/* Dynamic Viewport */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="animate-fade-in">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/chat" element={<ChatAssistant />} />
                  <Route path="/tasks" element={<TaskManager />} />
                  <Route path="/planner" element={<DailyPlanner />} />
                  <Route path="/email" element={<EmailGenerator />} />
                  <Route path="/summarize" element={<PdfSummarizer />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </TaskProvider>
  );
}

export default App;
