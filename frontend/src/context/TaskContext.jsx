import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  // --- Tasks State ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('flowmind_tasks');
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

  // --- Suggestions State ---
  const [suggestions, setSuggestions] = useState(() => {
    const saved = localStorage.getItem('flowmind_suggestions');
    return saved ? JSON.parse(saved) : [
      'Break up your tasks into smaller 25-minute Pomodoro focus blocks.',
      'Prioritize your high-priority items first thing in the morning.',
      'Use the Daily Planner to structure your work based on available hours.'
    ];
  });

  // --- Search Query State ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Settings & UI Customization State ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('flowmind_theme') || 'dark';
  });
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('flowmind_accent_color') || 'indigo';
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('flowmind_logged_in') === 'true';
  });

  // --- Notifications State ---
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('flowmind_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'n-1',
        title: 'Welcome to FlowMind AI Workspace!',
        type: 'system',
        time: 'Just now',
        read: false
      },
      {
        id: 'n-2',
        title: 'Gemini API Configured: Live responses active.',
        type: 'ai',
        time: '5 mins ago',
        read: false
      },
      {
        id: 'n-3',
        title: 'Default checklist loaded in Smart Tasks.',
        type: 'task',
        time: '1 hour ago',
        read: true
      }
    ];
  });

  // Persist states
  useEffect(() => {
    localStorage.setItem('flowmind_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('flowmind_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  useEffect(() => {
    localStorage.setItem('flowmind_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('flowmind_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.style.setProperty('--color-bg-dark', '#f8fafc');
      root.style.setProperty('--color-card-dark', 'rgba(255, 255, 255, 0.7)');
      root.style.setProperty('--color-card-dark-hover', 'rgba(255, 255, 255, 0.85)');
      root.style.setProperty('--color-border-dark', 'rgba(15, 23, 42, 0.08)');
      root.style.setProperty('color-scheme', 'light');
      root.style.setProperty('color', '#0f172a');
    } else {
      root.style.setProperty('--color-bg-dark', '#04060d');
      root.style.setProperty('--color-card-dark', 'rgba(8, 12, 28, 0.45)');
      root.style.setProperty('--color-card-dark-hover', 'rgba(12, 18, 40, 0.55)');
      root.style.setProperty('--color-border-dark', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('color-scheme', 'dark');
      root.style.setProperty('color', '#f1f5f9');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('flowmind_accent_color', accentColor);
    const root = document.documentElement;
    const colors = {
      indigo: { primary: '#4f46e5', hover: '#4338ca', secondary: '#8b5cf6' },
      violet: { primary: '#8b5cf6', hover: '#7c3aed', secondary: '#c084fc' },
      blue: { primary: '#3b82f6', hover: '#2563eb', secondary: '#60a5fa' },
      emerald: { primary: '#10b981', hover: '#059669', secondary: '#34d399' }
    };
    const selected = colors[accentColor] || colors.indigo;
    root.style.setProperty('--color-primary', selected.primary);
    root.style.setProperty('--color-primary-hover', selected.hover);
    root.style.setProperty('--color-secondary', selected.secondary);
  }, [accentColor]);

  // --- Auth Handlers ---
  const logout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('flowmind_logged_in');
    addNotification('Logged out successfully.', 'system');
  };

  // --- Notification Handlers ---
  const addNotification = (title, type = 'system') => {
    const newNotif = {
      id: Date.now().toString(),
      title,
      type,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // --- Task Handlers ---
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
    addNotification(`Task created: "${task.title}"`, 'task');
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
    addNotification(`Imported ${newTasks.length} tasks from AI.`, 'ai');
  };

  const updateTask = (id, updatedFields) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updatedFields } : task))
    );
    addNotification('Task updated.', 'task');
  };

  const deleteTask = (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (taskToDelete) {
      addNotification(`Task deleted: "${taskToDelete.title}"`, 'task');
    }
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
          addNotification(
            newStatus === 'Completed' 
              ? `Completed task: "${task.title}"` 
              : `Reopened task: "${task.title}"`,
            'task'
          );
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  };

  const addSuggestion = (suggestion) => {
    setSuggestions((prev) => {
      const filtered = prev.filter(s => s !== suggestion);
      return [suggestion, ...filtered].slice(0, 5);
    });
    addNotification('New AI productivity insight generated.', 'ai');
  };

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
        searchQuery,
        setSearchQuery,
        theme,
        setTheme,
        accentColor,
        setAccentColor,
        showSettingsModal,
        setShowSettingsModal,
        isLoggedIn,
        setIsLoggedIn,
        logout,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
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
