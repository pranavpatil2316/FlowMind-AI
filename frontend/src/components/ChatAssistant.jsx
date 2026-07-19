import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Plus, 
  Check, 
  Calendar, 
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import axios from 'axios';
import { useTasks } from '../context/TaskContext';

const ChatAssistant = () => {
  const { addTasks, addSuggestion } = useTasks();
  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'ai',
      text: "Hello! I am your AI Productivity Assistant. Type a goal or task you want to finish, and I'll break it down, estimate the duration, set priorities, and map out a schedule for you.\n\nFor example: *'I need to finish my AI project before Friday.'*",
      tasks: [],
      schedule: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedTaskMap, setAddedTaskMap] = useState({}); // tracking which message tasks were added
  
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      tasks: [],
      schedule: []
    };

    setMessages(prev => [...prev, userMessage]);
    const userPrompt = input;
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', { message: userPrompt });
      const data = response.data;

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        tasks: data.tasks || [],
        schedule: data.suggested_schedule || [],
        isMock: data.is_mock
      };

      setMessages(prev => [...prev, aiMessage]);

      if (data.is_mock) {
        addSuggestion("Configure your GEMINI_API_KEY in the backend .env to unlock real AI suggestions.");
      } else if (data.reply) {
        addSuggestion(data.reply.slice(0, 100) + "...");
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Oops, I encountered an issue connecting to the AI brain. Please check that the backend service is running.",
        tasks: [],
        schedule: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTasks = (msgId, tasksToAdd) => {
    addTasks(tasksToAdd);
    setAddedTaskMap(prev => ({ ...prev, [msgId]: true }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] max-w-4xl mx-auto glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl animate-slide-up">
      {/* Workspace Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse-slow shadow-lg shadow-violet-500/50" />
          <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">AI Workspace Consult Room</span>
        </div>
        <div className="text-[10px] text-cyan-400 font-bold bg-cyan-950/30 px-2.5 py-0.5 rounded-full border border-cyan-500/15 uppercase tracking-wider">Gemini 3.5 Flash</div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-4 max-w-[85%] animate-fade-in ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Profile Avatar Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
                isAi 
                  ? 'bg-gradient-to-tr from-violet-600 to-indigo-600' 
                  : 'bg-gradient-to-tr from-cyan-400 to-blue-500'
              }`}>
                {isAi ? <Sparkles size={15} /> : 'U'}
              </div>

              {/* Message Content Area */}
              <div className="space-y-4 flex-1 min-w-0">
                {/* Speech Bubble */}
                <div className={`p-4 rounded-2xl border leading-relaxed text-xs md:text-sm font-medium ${
                  isAi 
                    ? 'bg-white/[0.015] border-white/5 text-slate-200 rounded-tl-sm' 
                    : 'bg-violet-600/10 border-violet-500/25 text-white rounded-tr-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.isMock && (
                    <div className="mt-3.5 flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/15 border border-amber-500/20 text-[10px] text-amber-400 font-bold">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>Demo response. Add a GEMINI_API_KEY inside backend/.env for genuine AI results.</span>
                    </div>
                  )}
                </div>

                {/* Sub-Components generated by AI */}
                {isAi && msg.tasks && msg.tasks.length > 0 && (
                  <div className="glass-card border border-white/5 rounded-2xl p-4 md:p-5 space-y-3.5 shadow-lg">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-cyan-400" />
                        <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wide">Tasks Breakdown</h4>
                      </div>
                      
                      {addedTaskMap[msg.id] ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/15">
                          <Check size={11} />
                          <span>Added to Tasks</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddTasks(msg.id, msg.tasks)}
                          className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-white font-bold bg-violet-500/10 hover:bg-violet-600 border border-violet-500/20 px-2.5 py-1 rounded-lg transition-all active:scale-95"
                        >
                          <Plus size={11} />
                          <span>Add all to Tasks</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {msg.tasks.map((task, index) => (
                        <div key={index} className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.02] text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-white leading-snug">{task.title}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase ${
                              task.priority === 'High' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : task.priority === 'Medium'
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                : 'bg-green-500/10 text-green-400 border border-green-500/20'
                            }`}>{task.priority}</span>
                          </div>
                          
                          {task.description && (
                            <p className="text-slate-400 mt-2 leading-relaxed text-[11px] font-medium">{task.description}</p>
                          )}
                          
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mt-2.5">
                            <Clock size={11} />
                            <span>Est: {task.estimated_duration || task.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isAi && msg.schedule && msg.schedule.length > 0 && (
                  <div className="glass-card border border-white/5 rounded-2xl p-4 md:p-5 space-y-3.5 shadow-lg">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-white/[0.04]">
                      <Calendar size={14} className="text-pink-400" />
                      <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wide">Suggested Timeline</h4>
                    </div>
                    <div className="space-y-3.5 pl-3.5 border-l border-white/10">
                      {msg.schedule.map((slot, index) => (
                        <div key={index} className="flex items-start gap-3 text-xs leading-normal">
                          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/10 shrink-0 mt-0.5">{slot.split(':')[0]}</span>
                          <span className="text-slate-300 font-medium">{slot.includes(':') ? slot.split(':').slice(1).join(':').trim() : slot}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start gap-4 mr-auto max-w-[80%]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Sparkles size={15} className="animate-spin" />
            </div>
            <div className="p-4 rounded-2xl border bg-white/[0.015] border-white/5 text-slate-200 rounded-tl-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Prompt Box */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-slate-950/40 flex items-center">
        <div className="flex gap-2 w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Describe a goal or deadline (e.g. 'I need to write a presentation by tomorrow')"
            className="flex-1 px-4 py-3.5 text-xs md:text-sm bg-white/5 border border-white/5 focus:border-violet-500 focus:bg-white/[0.06] outline-none rounded-xl text-white placeholder-slate-500 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4.5 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 disabled:bg-violet-600/30 disabled:text-slate-500 text-white font-bold transition-all duration-150 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/10"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatAssistant;
