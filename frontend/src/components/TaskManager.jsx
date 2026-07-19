import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Clock, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const TaskManager = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  
  // Local UI States
  const [filter, setFilter] = useState('All'); // 'All' | 'Pending' | 'Completed'
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Add Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDuration, setNewDuration] = useState('1 hour');

  // Edit Form States
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editDuration, setEditDuration] = useState('1 hour');

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      duration: newDuration
    });

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewPriority('Medium');
    setNewDuration('1 hour');
    setShowAddForm(false);
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditDuration(task.duration);
  };

  const handleSaveEdit = (id) => {
    if (!editTitle.trim()) return;
    
    updateTask(id, {
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      duration: editDuration
    });
    
    setEditingId(null);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'Pending') return task.status === 'Pending';
    if (filter === 'Completed') return task.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-slide-up">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/50 border border-white/5 w-fit">
          {['All', 'Pending', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-250 ${
                filter === status
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] transition-all text-xs font-bold text-white shadow-lg shadow-violet-500/25"
        >
          {showAddForm ? <X size={15} /> : <Plus size={15} />}
          <span>{showAddForm ? 'Cancel Creation' : 'Create Task'}</span>
        </button>
      </div>

      {/* Add Task Form (Collapsible) */}
      {showAddForm && (
        <form 
          onSubmit={handleCreateTask}
          className="glass-card p-6 rounded-2xl border border-white/5 space-y-4.5 animate-fade-in"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Task Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
                className="w-full px-3.5 py-2.5 text-sm glass-input"
              />
            </div>
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Duration</label>
              <input
                type="text"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                placeholder="e.g. 1 hour, 45 mins"
                className="w-full px-3.5 py-2.5 text-sm glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Add some details..."
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm glass-input resize-none"
              />
            </div>
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority Level</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm glass-input bg-slate-950/80 cursor-pointer"
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98]"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card py-20 text-center rounded-2xl border border-white/5 animate-fade-in flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-400 mb-4 animate-float">
            <Briefcase size={20} />
          </div>
          <h3 className="text-sm font-bold text-white">No tasks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px] leading-relaxed">
            Create a task manually or consult the AI Assistant to generate them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTasks.map((task) => {
            const isEditing = editingId === task.id;
            const isCompleted = task.status === 'Completed';

            if (isEditing) {
              return (
                <div key={task.id} className="glass-card p-5 rounded-2xl border border-violet-500/30 space-y-3.5 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs glass-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Description</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-xs glass-input resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs glass-input bg-slate-950/80 cursor-pointer"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Duration</label>
                      <input
                        type="text"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs glass-input"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.04]">
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 rounded-lg border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-all active:scale-95"
                    >
                      <X size={13} />
                    </button>
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 transition-all active:scale-95"
                    >
                      <Check size={13} />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={task.id} 
                className={`glass-card p-5 rounded-2xl flex flex-col justify-between border transition-all ${
                  isCompleted ? 'border-emerald-500/15 opacity-70 bg-emerald-950/[0.01]' : 'border-white/5'
                }`}
              >
                <div>
                  {/* Card Header Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Checkbox with premium animations */}
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 scale-105'
                            : 'border-white/20 hover:border-violet-500 hover:scale-105'
                        }`}
                      >
                        {isCompleted && <Check size={12} strokeWidth={3.5} className="animate-fade-in" />}
                      </button>

                      {/* Title & Description */}
                      <div>
                        <h4 className={`text-sm font-bold text-white transition-all leading-snug ${
                          isCompleted ? 'line-through text-slate-500' : ''
                        }`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className={`text-xs mt-1.5 leading-relaxed transition-all ${
                            isCompleted ? 'text-slate-600' : 'text-slate-400'
                          }`}>{task.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 tracking-wide uppercase ${
                      task.priority === 'High' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : task.priority === 'Medium'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between border-t border-white/[0.04] mt-5 pt-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                    <Clock size={11} className="text-slate-400" />
                    <span>Est: {task.duration || '30 mins'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEditing(task)}
                      className="p-2 rounded-lg border border-transparent hover:border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-all active:scale-95"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-lg border border-transparent hover:border-red-500/15 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all active:scale-95"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskManager;
