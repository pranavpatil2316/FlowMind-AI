import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Plus, 
  Check, 
  Calendar, 
  AlertCircle,
  Clock,
  Briefcase,
  Paperclip,
  Smile,
  Image as ImageIcon,
  MoreHorizontal,
  Circle,
  TrendingUp,
  User,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { useTasks } from '../context/TaskContext';

const ChatAssistant = () => {
  const { addTasks, addSuggestion } = useTasks();
  
  // Set up the default messages to match the chat_workspace.png screenshot 100%
  const [messages, setMessages] = useState([
    {
      id: 'mock-user-1',
      sender: 'user',
      time: '10:30 AM',
      text: "FlowMind, I need to launch the Q3 marketing campaign. Break this down into priority tasks and a schedule."
    },
    {
      id: 'mock-ai-1',
      sender: 'ai',
      time: '10:30 AM',
      text: "Absolutely! Let's structure the Q3 Campaign. Here's a detailed breakdown:",
      goal: "Launch Q3 Marketing Campaign (July 1 - Sept 30)",
      isScreenshotMock: true,
      tasks: [
        { title: "P1: Content Strategy", deadline: "9/11 May", status: "Pending", priority: "High" },
        { title: "P2: Website Assets", deadline: "16 May", status: "In Progress", priority: "Medium" },
        { title: "P3: Email Sequence", deadline: "1/16 May", status: "Pending", priority: "Low" },
        { title: "P4: Social Media Planning", deadline: "Fri July", status: "In Progress", priority: "Medium" }
      ],
      schedule: [
        { day: "Mon 1", slots: ["09:00-11:00 (Content Strategy Session)", "14:00-16:00 (Outline Blog Posts)"] },
        { day: "Tue 2", slots: ["10:00-12:00 (Asset Creation)", "15:00-17:00 (Review Emails)"] }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedTaskMap, setAddedTaskMap] = useState({});
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
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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

      // Group schedule results into the Day-Slots schema if they contain day strings
      const formattedSchedule = data.suggested_schedule && data.suggested_schedule.length > 0
        ? [
            { 
              day: "Schedule", 
              slots: data.suggested_schedule 
            }
          ]
        : [];

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        text: data.reply,
        tasks: data.tasks || [],
        schedule: formattedSchedule,
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
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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
    // Standardize to matching task format
    const formatted = tasksToAdd.map(t => ({
      title: t.title,
      description: t.description || `Extracted task: ${t.title}`,
      priority: t.priority || "Medium",
      duration: t.estimated_duration || "1 hour"
    }));
    addTasks(formatted);
    setAddedTaskMap(prev => ({ ...prev, [msgId]: true }));
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] max-w-6xl mx-auto rounded-2xl overflow-hidden border border-white/5 shadow-2xl animate-slide-up">
      
      {/* 2-Column Split: Chat (Left/Center) & Workspace Info (Right) */}
      <div className="flex-1 flex flex-col h-full bg-slate-950/20 relative min-w-0">
        
        {/* Chat History Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3.5 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Profile Photo / Symbol */}
                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden shadow-md ${
                  isAi 
                    ? 'bg-gradient-to-tr from-indigo-500 to-purple-600' 
                    : 'bg-gradient-to-tr from-cyan-400 to-blue-500'
                }`}>
                  {isAi ? (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-600">
                      <Sparkles size={13} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cyan-600 font-bold text-xs">U</div>
                  )}
                </div>

                {/* Speech & structured data */}
                <div className="space-y-3.5 flex-1 min-w-0">
                  {/* Bubble header */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${!isAi ? 'flex-row-reverse' : ''}`}>
                    <span className="font-bold text-slate-300">{isAi ? 'FlowMind AI' : 'User (Me)'}</span>
                    <span>{msg.time}</span>
                  </div>

                  {/* Bubble content */}
                  <div className={`p-4 rounded-2xl border text-xs md:text-sm font-semibold leading-relaxed ${
                    isAi 
                      ? 'bg-white/[0.015] border-white/5 text-slate-200 rounded-tl-none' 
                      : 'bg-indigo-600/10 border-indigo-500/25 text-white rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Screenshot Mock Format or Active JSON Tasks */}
                  {isAi && msg.tasks && msg.tasks.length > 0 && (
                    <div className="glass-card border border-white/5 rounded-2xl p-4 md:p-5 space-y-4 shadow-lg">
                      
                      {/* Section 1: Goals */}
                      {msg.goal && (
                        <div className="pb-3 border-b border-white/[0.04] flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-white">
                            Goal Breakdown: <span className="text-slate-400 font-medium">{msg.goal}</span>
                          </span>
                          
                          {!addedTaskMap[msg.id] && (
                            <button
                              onClick={() => handleAddTasks(msg.id, msg.tasks)}
                              className="flex items-center gap-1 text-[9px] text-purple-400 hover:text-white font-extrabold bg-purple-500/10 hover:bg-purple-600 border border-purple-500/20 px-2 py-0.5 rounded-lg transition-all"
                            >
                              <Plus size={10} />
                              <span>Add to Tasks</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Section 2: Tasks List */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">**I. High-Priority Tasks:**</span>
                        <div className="space-y-2.5">
                          {msg.tasks.map((task, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 text-xs pl-2.5 border-l-2 border-indigo-500/30">
                              <span className="text-slate-300 font-semibold">
                                {idx + 1}. <strong className="text-white">{task.title}</strong>, Deadline: {task.deadline || task.estimated_duration || 'May'}
                              </span>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 uppercase ${
                                task.status === 'In Progress' 
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {task.status || task.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 3: Proposed Schedule */}
                      {msg.schedule && msg.schedule.length > 0 && (
                        <div className="space-y-3 pt-2 border-t border-white/[0.04]">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">**II. Proposed Schedule:**</span>
                          <div className="space-y-3">
                            {msg.schedule.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-4 text-xs">
                                {/* Day box */}
                                <div className="w-12 text-center bg-slate-900 border border-white/5 p-2 rounded-xl shrink-0 font-bold text-slate-400">
                                  {item.day || "Day"}
                                </div>
                                {/* Slots list */}
                                <div className="flex-1 space-y-1.5 pl-3 border-l border-white/5">
                                  {item.slots ? item.slots.map((slot, sIdx) => (
                                    <div key={sIdx} className="text-slate-300 font-medium leading-none">{slot}</div>
                                  )) : (
                                    <div className="text-slate-300 font-medium leading-none">{item}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input area styled exactly like chat_workspace.png */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-slate-950/40">
          <div className="glass-card rounded-2xl p-2 flex items-center gap-2 border border-white/5">
            {/* Left toolbar */}
            <div className="flex items-center gap-1 pl-1">
              <button type="button" className="p-2 rounded-lg text-slate-500 hover:text-white transition-colors">
                <Paperclip size={14} />
              </button>
              <button type="button" className="p-2 rounded-lg text-slate-500 hover:text-white transition-colors">
                <Smile size={14} />
              </button>
              <button type="button" className="p-2 rounded-lg text-slate-500 hover:text-white transition-colors">
                <ImageIcon size={14} />
              </button>
            </div>

            {/* Input field */}
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Chat info..."
                className="w-full bg-transparent border-none outline-none text-white text-xs py-2 px-1 placeholder-slate-600"
              />
              {/* Pill badge showing brand */}
              <div className="absolute right-2 hidden sm:flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-500/30 text-[9px] font-bold text-white px-2.5 py-0.5 rounded-full shrink-0">
                <Sparkles size={8} />
                <span>FlowMind AI</span>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <button type="button" className="p-2 rounded-lg text-slate-500 hover:text-white transition-colors">
                <MoreHorizontal size={14} />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:bg-purple-600/30 disabled:text-slate-500 text-xs font-bold text-white transition-all shadow-lg"
              >
                <span>Send</span>
              </button>
            </div>
          </div>
        </form>

      </div>

      {/* Right Sidebar: Workspace Details Panel (matching chat_workspace.png) */}
      <div className="hidden lg:flex w-64 border-l border-white/5 bg-slate-950/30 flex-col justify-between shrink-0 p-5 space-y-6">
        
        {/* Participants */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Participants</span>
          <div className="space-y-2.5">
            {/* User */}
            <div className="flex items-center gap-2.5 text-xs font-bold text-white">
              <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white text-[9px]">U</div>
              <span>User</span>
            </div>
            {/* AI */}
            <div className="flex items-center gap-2.5 text-xs font-bold text-white">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <Sparkles size={9} />
              </div>
              <span>FlowMind AI</span>
            </div>
          </div>
        </div>

        {/* Active Tasks list matching screenshot */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Tasks</span>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Circle size={8} className="fill-purple-400 stroke-purple-400 text-purple-400" />
              <span className="truncate">Content Strategy</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Circle size={8} className="fill-amber-400 stroke-amber-400 text-amber-400" />
              <span className="truncate">Website Assets</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Circle size={8} className="fill-indigo-400 stroke-indigo-400 text-indigo-400" />
              <span className="truncate">Email Sequence</span>
            </div>
          </div>
        </div>

        {/* Recent Activities Feed */}
        <div className="space-y-3 flex-1 flex flex-col justify-end">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recent Activity</span>
          <div className="space-y-3.5 border-l border-white/5 pl-3">
            <div className="text-[10px] text-slate-400 font-semibold leading-normal">
              <strong className="text-white">John Doe</strong> updated Content Strategy
              <span className="block text-[8px] text-slate-500 font-medium mt-0.5">12 minutes ago</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold leading-normal">
              <strong className="text-white">FlowMind AI</strong> optimized workflow paths
              <span className="block text-[8px] text-slate-500 font-medium mt-0.5">3 hours ago</span>
            </div>
          </div>
        </div>

        {/* Footer profile indicator */}
        <div className="pt-4.5 border-t border-white/5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-white text-[9px] font-bold shadow-md">JD</div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-white block truncate leading-none">John Doe</span>
            <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
              <span>online</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ChatAssistant;
