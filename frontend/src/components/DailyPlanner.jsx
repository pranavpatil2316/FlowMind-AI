import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  Lightbulb, 
  CheckSquare, 
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import axios from 'axios';
import { useTasks } from '../context/TaskContext';

const DailyPlanner = () => {
  const { tasks, addSuggestion } = useTasks();
  
  // Input States
  const [prompt, setPrompt] = useState('I have 3 hours today to work.');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Output States
  const [schedule, setSchedule] = useState([]);
  const [tips, setTips] = useState([]);
  const [isMock, setIsMock] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Retrieve pending tasks that could be scheduled
  const pendingTasks = tasks.filter(t => t.status === 'Pending');

  const toggleTaskSelection = (id) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setGenerated(false);
    
    // Resolve titles of selected tasks to include in backend request
    const selectedTaskTitles = tasks
      .filter(t => selectedTaskIds.includes(t.id))
      .map(t => t.title);

    try {
      const response = await axios.post('/api/planner', {
        prompt,
        tasks: selectedTaskTitles
      });

      const data = response.data;
      setSchedule(data.schedule || []);
      setTips(data.productivity_tips || []);
      setIsMock(data.is_mock || false);
      setGenerated(true);

      if (data.productivity_tips && data.productivity_tips.length > 0) {
        addSuggestion(data.productivity_tips[0]);
      }

    } catch (error) {
      console.error('Planner error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Planner Setup Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Daily Schedule Setup</h3>
              <p className="text-[11px] text-slate-400 mt-1">Specify your available hours and the tasks you wish to cover.</p>
            </div>

            <form onSubmit={handleGenerateSchedule} className="space-y-4.5">
              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Time Context</label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. I have 4 hours this afternoon"
                  required
                  className="w-full px-3.5 py-2.5 text-sm glass-input"
                />
              </div>

              {/* Task Selector */}
              {pendingTasks.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incorporate Pending Tasks</label>
                  <div className="max-h-48 overflow-y-auto space-y-2 border border-white/5 rounded-xl p-2.5 bg-slate-950/40">
                    {pendingTasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => toggleTaskSelection(task.id)}
                        className={`p-2.5 rounded-lg text-xs flex items-center gap-2.5 cursor-pointer transition-all border ${
                          selectedTaskIds.includes(task.id)
                            ? 'bg-violet-600/10 border-violet-500/35 text-white'
                            : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={() => {}} // handled by parent click
                          className="rounded border-slate-600 text-violet-600 focus:ring-violet-500 pointer-events-none"
                        />
                        <span className="truncate flex-1 font-semibold leading-none">{task.title}</span>
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded shrink-0 font-bold">{task.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] disabled:bg-violet-600/30 disabled:text-slate-500 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all"
              >
                {loading ? (
                  <>
                    <Activity size={14} className="animate-spin" />
                    <span>Mapping Timeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Day Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Timeline & Tips */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main output placeholder */}
          {!generated && !loading && (
            <div className="glass-card py-28 text-center rounded-2xl border border-white/5 flex flex-col items-center justify-center animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-400 mb-4 animate-float">
                <Calendar size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Daily Schedule timeline</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                Provide your availability context on the left to structure your hourly schedule blocks.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card py-28 text-center rounded-2xl border border-white/5 flex flex-col items-center justify-center animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4 animate-spin">
                <Activity size={20} />
              </div>
              <h3 className="text-sm font-bold text-white animate-pulse">Consulting AI Planner...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                Creating optimized hourly focus intervals for maximum productivity.
              </p>
            </div>
          )}

          {generated && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              
              {/* Timeline visual blocks */}
              <div className="md:col-span-2 glass-card p-5 md:p-6 rounded-2xl border border-white/5 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Structured Work Timeline</h3>
                  {isMock && (
                    <div className="mt-2 flex items-start gap-1 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <span>Demo Timeline. Insert Gemini API Key to customize schedule slots.</span>
                    </div>
                  )}
                </div>

                {/* Timeline Tracks */}
                <div className="relative pl-6 border-l-2 border-white/10 space-y-6 ml-2">
                  {schedule.map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[32px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-950/40 border border-cyan-400 shadow-md shadow-cyan-400/50" />
                      
                      {/* Content Card */}
                      <div className="p-4 rounded-xl bg-white/[0.015] border border-white/[0.04] text-xs hover:border-violet-500/20 hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-cyan-400 font-bold bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-500/10">{item.time}</span>
                          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                            <Clock size={11} />
                            <span>{item.duration}</span>
                          </span>
                        </div>
                        <h4 className="text-white font-bold mt-2.5 text-xs md:text-sm">{item.activity}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Productivity tips column */}
              <div className="md:col-span-1 glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-3">
                    <Lightbulb size={16} className="text-amber-400" />
                    <h3 className="text-[10px] font-bold text-white tracking-wider uppercase">AI Strategy Tips</h3>
                  </div>

                  <div className="mt-4 space-y-4">
                    {tips.map((tip, idx) => (
                      <div key={idx} className="flex gap-2 text-[11px] text-slate-300 leading-relaxed font-semibold">
                        <TrendingUp size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-3.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-[10px] text-violet-400 leading-relaxed flex items-start gap-2 font-bold">
                  <CheckSquare size={13} className="shrink-0 mt-0.5 text-violet-400" />
                  <span>These blocks are structured to limit decision-fatigue and ensure high concentration.</span>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;
