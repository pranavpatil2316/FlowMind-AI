import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Clock, 
  Award, 
  TrendingUp, 
  Lightbulb, 
  ArrowRight,
  MessageSquare,
  Calendar,
  Mail,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useTasks } from '../context/TaskContext';

const Dashboard = () => {
  const { tasks, suggestions, productivityScore } = useTasks();
  const navigate = useNavigate();

  // Task computations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Chart calculation: Grouped by Priority
  const getPriorityStats = () => {
    const stats = {
      High: { Completed: 0, Pending: 0 },
      Medium: { Completed: 0, Pending: 0 },
      Low: { Completed: 0, Pending: 0 }
    };
    
    tasks.forEach(t => {
      const p = t.priority || 'Medium';
      const status = t.status === 'Completed' ? 'Completed' : 'Pending';
      if (stats[p]) {
        stats[p][status]++;
      }
    });

    return [
      { name: 'High Priority', Completed: stats.High.Completed, Pending: stats.High.Pending },
      { name: 'Medium Priority', Completed: stats.Medium.Completed, Pending: stats.Medium.Pending },
      { name: 'Low Priority', Completed: stats.Low.Completed, Pending: stats.Low.Pending },
    ];
  };

  const chartData = getPriorityStats();

  const quickActions = [
    { name: 'Ask Assistant', icon: MessageSquare, desc: 'Generate task lists & breakdown goals', path: '/chat', color: 'from-violet-500 to-indigo-600' },
    { name: 'Plan My Day', icon: Calendar, desc: 'Structure calendar blocks dynamically', path: '/planner', color: 'from-cyan-500 to-blue-600' },
    { name: 'Compose Email', icon: Mail, desc: 'Draft outreach messages & requests', path: '/email', color: 'from-pink-500 to-rose-600' },
    { name: 'Upload PDF', icon: FileText, desc: 'Parse docs & retrieve action checklists', path: '/summarize', color: 'from-emerald-500 to-teal-600' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-slide-up">
      {/* Header Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
          Welcome to FlowMind AI, Pranav!
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-2 font-medium">
          Here's your productivity overview for today.
        </p>
      </div>

      {/* KPI Stats Row with Premium Border Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Tasks Card */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-t-2 border-t-violet-500/50">
          <div className="p-3.5 rounded-xl bg-violet-500/10 text-violet-400 shrink-0">
            <CheckSquare size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Tasks</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight">{totalTasks}</h3>
          </div>
        </div>

        {/* Pending Card */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-t-2 border-t-cyan-500/50">
          <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight">{pendingTasks}</h3>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-t-2 border-t-emerald-500/50">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completion %</span>
            <div className="flex items-center gap-3 mt-1">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{completionPercentage}%</h3>
              <div className="flex-1 bg-slate-800/80 h-1.5 rounded-full overflow-hidden hidden sm:block">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Score Card */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group border-t-2 border-t-amber-500/50">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-300 pointer-events-none" />
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 z-10">
            <Award size={20} />
          </div>
          <div className="z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Productivity Score</span>
            <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight">{productivityScore}</h3>
          </div>
        </div>
      </div>

      {/* Charts & AI Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Analytics Card */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Task Distribution Matrix</h3>
            <p className="text-[11px] text-slate-400 mt-1">Classification of tasks by priority level and completion status</p>
          </div>
          <div className="h-64 mt-6 text-[10px] font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" allowDecimals={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0f20', 
                    borderColor: 'rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Legend wrapperStyle={{ paddingTop: 12 }} />
                <Bar dataKey="Completed" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Pending" fill="#06b6d4" radius={[5, 5, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Suggestions Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border-t-2 border-t-violet-500/30">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Recent AI Suggestions</h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Smart, context-aware tips generated from your current dashboard status</p>

            <div className="mt-6 space-y-3.5">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] text-[11px] text-slate-300 flex items-start gap-2.5 hover:border-violet-500/20 hover:bg-white/[0.03] transition-all duration-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <p className="leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/chat')} 
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all text-xs font-bold text-white shadow-lg shadow-violet-500/25"
          >
            <span>Consult Assistant</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Quick Launch Card Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide uppercase text-slate-400">Quick Productivity Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <div 
                key={i} 
                onClick={() => navigate(action.path)}
                className="glass-card p-5 rounded-2xl cursor-pointer hover:scale-[1.02] group flex flex-col justify-between h-36 border border-white/[0.03]"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${action.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors duration-200">{action.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{action.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
