import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskProvider, useTasks } from '../context/TaskContext';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import EmailGenerator from '../components/EmailGenerator';
import { BrowserRouter as Router } from 'react-router-dom';

// Simple consumer to test Context API
const ContextConsumer = () => {
  const { tasks, addTask, toggleTask, productivityScore } = useTasks();
  return (
    <div>
      <span data-testid="score">{productivityScore}</span>
      <span data-testid="tasks-count">{tasks.length}</span>
      <button 
        data-testid="add-btn" 
        onClick={() => addTask({ title: 'New Test Task', priority: 'High', duration: '1 hour' })}
      >
        Add
      </button>
      {tasks.map(t => (
        <button 
          key={t.id}
          data-testid={`complete-btn-${t.id}`}
          onClick={() => toggleTask(t.id)}
        >
          Complete {t.title}
        </button>
      ))}
    </div>
  );
};

describe('TaskContext State management', () => {
  it('initializes with default settings and handles adding/completing tasks', () => {
    render(
      <TaskProvider>
        <ContextConsumer />
      </TaskProvider>
    );

    // Initial state check should be 50% completed points
    expect(screen.getByTestId('score')).toHaveTextContent('50');
    expect(screen.getByTestId('tasks-count')).toHaveTextContent('3');
    
    // Add task
    const addBtn = screen.getByTestId('add-btn');
    fireEvent.click(addBtn);

    expect(screen.getByTestId('tasks-count')).toHaveTextContent('4');
  });
});

describe('Sidebar Component Renders', () => {
  it('renders brand title and essential menu links', () => {
    render(
      <TaskProvider>
        <Router>
          <Sidebar isOpen={true} toggleSidebar={() => {}} />
        </Router>
      </TaskProvider>
    );

    expect(screen.getByText('FlowMind AI')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AI Workspace')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });
});

describe('EmailGenerator Component Renders', () => {
  it('renders description prompts, selectors and composed areas', () => {
    render(
      <TaskProvider>
        <EmailGenerator />
      </TaskProvider>
    );

    expect(screen.getByText('Outreach parameters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Asking for project delay explanation/i)).toBeInTheDocument();
  });
});
