import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ListTodo, 
  Calendar, 
  Mail, 
  FileText, 
  Menu, 
  X, 
  TrendingUp,
  Settings
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { setShowSettingsModal } = useTasks();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'AI Workspace', path: '/chat', icon: MessageSquare },
    { name: 'Tasks', path: '/tasks', icon: ListTodo },
    { name: 'Daily Planner', path: '/planner', icon: Calendar },
    { name: 'Email Generator', path: '/email', icon: Mail },
    { name: 'PDF Summarizer', path: '/summarize', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900/80 border border-slate-700/50 backdrop-blur-md text-white hover:bg-slate-800 transition-all duration-200"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-white/5 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Brand Area (restored geometric FM logo) */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 shadow-md flex items-center justify-center shrink-0 text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.7))' }}>
                <path d="M4 20V4h9M4 12h6" />
                <path d="M12 20V8l4 4 4-4v12" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                FlowMind AI
              </h1>
              <span className="text-[8px] text-purple-400 font-extrabold uppercase tracking-wider block mt-0.5">
                Productivity OS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/20 to-purple-500/10 border border-indigo-500/35 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon 
                        size={18} 
                        className={`transition-colors duration-200 ${
                          isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'
                        }`} 
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                      {isActive && (
                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Custom Settings Trigger Link */}
            <button
              onClick={() => {
                setShowSettingsModal(true);
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent group relative text-left"
            >
              <Settings 
                size={18} 
                className="transition-colors duration-200 text-slate-400 group-hover:text-white" 
              />
              <span className="text-sm font-medium">Settings</span>
            </button>
          </nav>
        </div>

        {/* User Card Bottom Area (consistently PP / Pranav Patil) */}
        <div className="p-4 border-t border-white/5 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              PP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Pranav Patil</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <TrendingUp size={12} className="text-green-400" />
                <span className="text-[10px] text-green-400 font-medium">94% Productivity</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
