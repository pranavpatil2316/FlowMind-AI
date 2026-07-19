import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('ai_tasks');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Review Project Documentation',
        priority: 'High',
        status: 'Completed',
        duration: '1 hour',
        description: 'Read the initial setup instructions and scope guidelines.'
      },
      {
        id: '2',
        title: 'Design UI Layout mockups',
        priority: 'Medium',
        status: 'Pending',
        duration: '2 hours',
        description: 'Brainstorm page dashboard architectures and glassmorphic aesthetics.'
      },
      {
        id: '3',
        title: 'Setup API Gateway routes',
        priority: 'Low',
        status: 'Pending',
        duration: '45 mins',
        description: 'Implement fastapi route structures and coordinate CORS.'
      }
    ];
  });

  const [suggestions, setSuggestions] = useState(() => {
    const saved = localStorage.getItem('ai_suggestions');
    return saved ? JSON.parse(saved) : [
      'Break up your tasks into smaller 25-minute Pomodoro focus blocks.',
      'Prioritize your high-priority items first thing in the morning.',
      'Use the Daily Planner to structure your work based on available hours.'
    ];
  });

  useEffect(() => {
    localStorage.setItem('ai_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ai_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),
      status: 'Pending',
      description: task.description || '',
      duration: task.duration || '30 mins',
      priority: task.priority || 'Medium',
      ...task
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const addTasks = (newTasks) => {
    const formatted = newTasks.map((t) => ({
      id: (Date.now() + Math.random()).toString(),
      status: 'Pending',
      description: t.description || '',
      duration: t.estimated_duration || t.duration || '30 mins',
      priority: t.priority || 'Medium',
      title: t.title
    }));
    setTasks((prev) => [...formatted, ...prev]);
  };

  const updateTask = (id, updatedFields) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updatedFields } : task))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' }
          : task
      )
    );
  };

  const addSuggestion = (suggestion) => {
    setSuggestions((prev) => {
      const filtered = prev.filter(s => s !== suggestion); // prevent duplicates
      return [suggestion, ...filtered].slice(0, 5); // keep last 5
    });
  };

  // Dynamic Productivity Score formula
  // Score = sum(completed_task_weight) / sum(total_task_weight) * 100
  // weights: High = 3, Medium = 2, Low = 1
  const getProductivityScore = () => {
    if (tasks.length === 0) return 100;
    
    const weightMap = { High: 3, Medium: 2, Low: 1 };
    let totalPoints = 0;
    let completedPoints = 0;
    
    tasks.forEach(t => {
      const weight = weightMap[t.priority] || 2;
      totalPoints += weight;
      if (t.status === 'Completed') {
        completedPoints += weight;
      }
    });

    return Math.round((completedPoints / totalPoints) * 100);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        suggestions,
        addTask,
        addTasks,
        updateTask,
        deleteTask,
        toggleTask,
        addSuggestion,
        productivityScore: getProductivityScore()
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
