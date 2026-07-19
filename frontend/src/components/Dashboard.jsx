import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  RefreshCw, 
  Lightbulb, 
  Sparkles, 
  CheckCircle,
  Circle,
  TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTasks } from '../context/TaskContext';

const Dashboard = () => {
  const { tasks, suggestions, addNotification } = useTasks();
  const navigate = useNavigate();

  // Spinning states for refresh actions
  const [spinning, setSpinning] = useState({
    overview: false,
    priority: false,
    insights: false,
    activities: false
  });

  const handleRefresh = (section) => {
    setSpinning(prev => ({ ...prev, [section]: true }));
    setTimeout(() => {
      setSpinning(prev => ({ ...prev, [section]: false }));
      addNotification(`Refreshed ${section} data successfully.`, 'system');
    }, 600);
  };

  // Task computations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Donut chart priority allocations
  const priorityData = [
    { name: 'Critical', value: 20, fill: '#f43f5e' }, // rose-500
    { name: 'High', value: 35, fill: '#8b5cf6' },     // violet-500
    { name: 'Medium', value: 25, fill: '#6366f1' },   // indigo-500
    { name: 'Low', value: 20, fill: '#06b6d4' }       // cyan-500
  ];

  return (
    <div className="space-y-6 w-full animate-slide-up h-full text-left">
      {/* 2x2 Grid Widget Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Widget 1: Task Overview */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-[320px] border border-white/5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">Task Overview</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/tasks')} 
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus size={10} />
                <span>Add Task</span>
              </button>
              <button 
                onClick={() => handleRefresh('overview')}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
              >
                <RefreshCw size={11} className={spinning.overview ? 'animate-spin text-purple-400' : ''} />
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-white tracking-tight">{totalTasks}</span>
              <span className="text-xs text-slate-400 font-bold">Current Tasks:</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-4 h-32 mt-4 pb-2">
            {/* Completed */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="w-full bg-slate-950/40 rounded-lg h-20 relative overflow-hidden flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-b-lg transition-all duration-500" 
                  style={{ height: `${completionPercentage || 65}%` }} 
                />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Tasks Completed</span>
                <span className="text-[11px] text-white font-bold">{completedTasks} <span className="text-slate-500 font-medium">({completionPercentage}%)</span></span>
              </div>
            </div>

            {/* In Progress */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="w-full bg-slate-950/40 rounded-lg h-20 relative overflow-hidden flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-purple-500 to-indigo-400 rounded-b-lg transition-all duration-500" 
                  style={{ height: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 30}%` }} 
                />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">In Progress</span>
                <span className="text-[11px] text-white font-bold">{pendingTasks}</span>
              </div>
            </div>

            {/* To Do */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="w-full bg-slate-950/40 rounded-lg h-20 relative overflow-hidden flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-500 to-blue-400 rounded-b-lg transition-all duration-500" 
                  style={{ height: '8%' }} 
                />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">To Do</span>
                <span className="text-[11px] text-white font-bold">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: Priority Chart */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-[320px] border border-white/5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">Priority Chart</span>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded-lg hover:bg-white/5 text-slate-400"><Plus size={12} /></button>
              <button 
                onClick={() => handleRefresh('priority')}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
              >
                <RefreshCw size={11} className={spinning.priority ? 'animate-spin text-purple-400' : ''} />
              </button>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="h-40 mt-4 relative flex items-center justify-center">
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Task</span>
              <span className="text-xs font-extrabold text-white">Priorities</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Table */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-[10px] text-slate-400 font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Critical (20%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span>Medium (25%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
              <span>High (35%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              <span>Low (20%)</span>
            </div>
          </div>
        </div>

        {/* Widget 3: AI Productivity Insights */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-[320px] border border-white/5 shadow-lg">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.04]">
            <span className="text-sm font-bold text-white tracking-wide">AI Productivity Insights</span>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded-lg hover:bg-white/5 text-slate-400"><Plus size={12} /></button>
              <button 
                onClick={() => handleRefresh('insights')}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
              >
                <RefreshCw size={11} className={spinning.insights ? 'animate-spin text-purple-400' : ''} />
              </button>
            </div>
          </div>

          <div className="mt-4 flex-1 text-left">
            <div className="flex items-center gap-1.5 mb-3.5">
              <Lightbulb size={14} className="text-amber-400" />
              <span className="text-[11px] font-bold text-white tracking-wide">FlowMind AI Suggestions</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/20 border border-white/[0.03] text-[11px] font-semibold text-slate-300 hover:border-purple-500/25 transition-all">
                Optimize scheduling for 'Project Zenith' (High)
              </div>
              <div className="p-3 rounded-xl bg-slate-950/20 border border-white/[0.03] text-[11px] font-semibold text-slate-300 hover:border-purple-500/25 transition-all">
                Automate recurring task reports
              </div>
              <div className="p-3 rounded-xl bg-slate-950/20 border border-white/[0.03] text-[11px] font-semibold text-slate-300 hover:border-purple-500/25 transition-all">
                Refine focus hours for Pranav Patil
              </div>
            </div>
          </div>
        </div>

        {/* Widget 4: Recent Activities */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between h-[320px] border border-white/5 shadow-lg">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.04]">
            <span className="text-sm font-bold text-white tracking-wide">Recent Activities</span>
            <button 
              onClick={() => handleRefresh('activities')}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
            >
              <RefreshCw size={11} className={spinning.activities ? 'animate-spin text-purple-400' : ''} />
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-4 text-left">
            {/* Item 1 */}
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400">
                <Circle size={10} className="fill-purple-400 stroke-purple-400 text-purple-400" />
              </div>
              <span className="flex-1">Design Team: Task updated</span>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-purple-400">
                <Sparkles size={12} className="text-purple-400" />
              </div>
              <span className="flex-1">AI optimized Workflow A</span>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-emerald-400">
                <CheckCircle size={12} className="text-emerald-400" />
              </div>
              <span className="flex-1">Marked: UI Mock complete</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
