import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import TaskManager from './components/TaskManager';
import DailyPlanner from './components/DailyPlanner';
import EmailGenerator from './components/EmailGenerator';
import PdfSummarizer from './components/PdfSummarizer';
import { TaskProvider, useTasks } from './context/TaskContext';
import { X, Check } from 'lucide-react';

function AppContent() {
  const { 
    isLoggedIn, 
    setIsLoggedIn,
    showSettingsModal, 
    setShowSettingsModal, 
    theme, 
    setTheme, 
    accentColor, 
    setAccentColor,
    addNotification
  } = useTasks();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loadingApp, setLoadingApp] = React.useState(true);
  const [loginLoading, setLoginLoading] = React.useState(false);

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
    setTimeout(() => {
      setIsLoggedIn(true);
      sessionStorage.setItem('flowmind_logged_in', 'true');
      setLoginLoading(false);
      addNotification('Logged in as Pranav Patil.', 'system');
    }, 1000);
  };

  // 1. Splash Loading View (with restored original geometric FM logo)
  if (loadingApp) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-bg-dark bg-gradient-radial text-slate-100 relative">
        <div className="glow-orb w-[400px] h-[400px] bg-indigo-600/10 top-[20%] left-[30%] animate-float" />
        <div className="glow-orb w-[400px] h-[400px] bg-purple-600/10 bottom-[20%] right-[30%] animate-float-slow" />
        
        <div className="z-10 flex flex-col items-center text-center space-y-6">
          {/* Pulsing FM Geometric Logo */}
          <div className="p-4.5 rounded-2xl bg-slate-950/60 border border-white/5 shadow-2xl shadow-purple-500/20 animate-pulse-slow">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.75))' }}>
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
          {/* Brand Geometric Logo */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 shadow-md flex items-center justify-center text-white">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.7))' }}>
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

            {/* Workspace Key (Password) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workspace Key</label>
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
    <Router>
      <div className="flex h-screen w-screen items-center justify-center bg-bg-dark bg-gradient-radial text-slate-200 relative p-4 md:p-6 overflow-hidden">
        
        {/* Ambient Background Glow Orbs */}
        <div className="glow-orb w-[550px] h-[550px] bg-indigo-600/8 top-[-100px] right-[-100px] animate-float" />
        <div className="glow-orb w-[650px] h-[650px] bg-purple-500/6 bottom-[-150px] left-[-150px] animate-float-slow" />
        <div className="glow-orb w-[450px] h-[450px] bg-blue-500/4 top-[35%] left-[40%] animate-float" style={{ animationDelay: '-4s' }} />

        {/* Styled browser frame window container matching screenshots */}
        <div className="w-full max-w-7xl h-full flex rounded-[24px] border border-white/5 glass-panel shadow-2xl overflow-hidden z-10 relative">
          
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Navbar */}
            <Navbar />

            {/* Dynamic Viewport */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900/10">
              <div className="animate-fade-in h-full">
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

        {/* --- Global Settings Modal --- */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg glass-card border border-white/10 rounded-3xl p-6 relative shadow-2xl text-left animate-slide-up">
              {/* Close Button */}
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={16} />
              </button>

              <h2 className="text-base font-extrabold text-white tracking-tight leading-none mb-5">
                FlowMind AI Settings
              </h2>

              <div className="space-y-6">
                {/* 1. Theme Configuration */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workspace Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`py-2 px-4 rounded-xl border text-xs font-semibold text-center transition-all ${
                        theme === 'dark'
                          ? 'bg-purple-600/25 border-purple-500/50 text-white'
                          : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      Dark Mode (Default)
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`py-2 px-4 rounded-xl border text-xs font-semibold text-center transition-all ${
                        theme === 'light'
                          ? 'bg-white/40 border-white/20 text-slate-900 shadow-md'
                          : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      Light Mode
                    </button>
                  </div>
                </div>

                {/* 2. Accent color Configuration */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accent Brand Theme</label>
                  <div className="flex items-center gap-3">
                    {[
                      { id: 'indigo', color: 'bg-indigo-600' },
                      { id: 'violet', color: 'bg-violet-500' },
                      { id: 'blue', color: 'bg-blue-500' },
                      { id: 'emerald', color: 'bg-emerald-500' }
                    ].map((col) => (
                      <button
                        key={col.id}
                        onClick={() => setAccentColor(col.id)}
                        className={`w-8 h-8 rounded-full ${col.color} border-2 flex items-center justify-center transition-all ${
                          accentColor === col.id ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                        }`}
                      >
                        {accentColor === col.id && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Profile Information (updated to Pranav Patil) */}
                <div className="p-4 rounded-2xl bg-slate-950/20 border border-white/5 space-y-2">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">User Profile</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">User Name</span>
                      <span className="text-white font-bold">Pranav Patil</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Email Address</span>
                      <span className="text-white font-bold">pranav.patil@flowmind.ai</span>
                    </div>
                  </div>
                </div>

                {/* 4. About Info */}
                <div className="text-center text-[10px] text-slate-500 leading-relaxed pt-2">
                  <p className="font-bold text-slate-400">FlowMind AI Productivity Workspace v1.0.0</p>
                  <p className="mt-1">Powered by Google Gemini 3.5 Flash. Open sourced under MIT License.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;
