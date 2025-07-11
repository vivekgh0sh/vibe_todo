/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Define the structure of a single to-do item
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  animationState?: 'completing' | 'deleting'; // For animations
}

// Define the available themes
const themes = ['light-default', 'light-serene', 'dark-cool', 'dark-slate'] as const;
type Theme = typeof themes[number];

// Main application component
function App() {
  // Load todos from localStorage or use initial data as a fallback
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        return JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
      }
    } catch (error) {
      console.error("Failed to load todos from localStorage", error);
    }
    // Fallback data for first-time users
    return [
      { id: 1, text: 'Experience the new Liquid Glass theme', completed: false, createdAt: new Date() },
      { id: 2, text: 'Try the other themes with the 🎨 button', completed: false, createdAt: new Date() },
    ];
  });

  // Load completed todos from localStorage or use initial data
  const [completedTodos, setCompletedTodos] = useState<Todo[]>(() => {
    try {
      const savedCompleted = localStorage.getItem('completedTodos');
      if (savedCompleted) {
        return JSON.parse(savedCompleted).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
      }
    } catch (error) {
      console.error("Failed to load completed todos from localStorage", error);
    }
    return [{ id: 3, text: 'Walk the dog', completed: true, createdAt: new Date(Date.now() - 86400000) }];
  });

  // Load theme from localStorage
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (themes.includes(savedTheme)) {
        return savedTheme;
      }
    } catch (error) { console.error("Failed to load theme", error); }
    return themes[0];
  });

  // State for the special Liquid Glass theme
  const [isGlassMode, setIsGlassMode] = useState(() => {
     try {
      return localStorage.getItem('glassMode') === 'true';
    } catch (error) { console.error("Failed to load glass mode", error); }
    return false;
  });
  
  const [newTodo, setNewTodo] = useState('');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // --- LOCALSTORAGE & THEME EFFECTS ---
  useEffect(() => { localStorage.setItem('todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('completedTodos', JSON.stringify(completedTodos)); }, [completedTodos]);

  // Apply theme to body and save to localStorage
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
    if (isGlassMode) {
      document.body.classList.add('glass-mode');
    }
    localStorage.setItem('theme', theme);
    localStorage.setItem('glassMode', String(isGlassMode));
  }, [theme, isGlassMode]);

  // Cycle through available themes
  const handleThemeChange = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };
  
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === '') return;
    const newTodoItem: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      createdAt: new Date(),
    };
    setTodos([newTodoItem, ...todos]);
    setNewTodo('');
  };

  const handleDeleteTodo = (id: number, listType: 'active' | 'completed') => {
    const animationDuration = 800; 

    if (listType === 'active') {
      setTodos(current => current.map(todo => todo.id === id ? { ...todo, animationState: 'deleting' } : todo));
      setTimeout(() => {
        setTodos(current => current.filter(todo => todo.id !== id));
      }, animationDuration);
    } else {
      setCompletedTodos(current => current.map(todo => todo.id === id ? { ...todo, animationState: 'deleting' } : todo));
      setTimeout(() => {
        setCompletedTodos(current => current.filter(todo => todo.id !== id));
      }, animationDuration);
    }
  };

  const handleCompleteTodo = (id: number) => {
    const todoToComplete = todos.find((todo) => todo.id === id);
    if (!todoToComplete) return;
    const animationDuration = 800;
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, animationState: 'completing' } : todo));

    setTimeout(() => {
      setCompletedTodos((prevCompleted) => [
        { ...todoToComplete, completed: true, animationState: undefined },
        ...prevCompleted,
      ]);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    }, animationDuration);
  };
  
  const renderTodoItem = (todo: Todo, isHistory = false) => {
    const animationClass = 
      todo.animationState === 'completing' ? 'animating-complete' :
      todo.animationState === 'deleting' ? 'animating-delete' : '';

    return (
      <li key={todo.id} className={`${todo.completed ? 'completed' : ''} ${animationClass}`}>
        <div className="todo-checkbox-wrapper" onClick={() => !isHistory && !todo.animationState && handleCompleteTodo(todo.id)} role="button">
          <span className="todo-checkbox"></span>
        </div>
        <div className="todo-main">
          <span className="todo-text">{todo.text}</span>
          <span className="todo-timestamp">{todo.createdAt.toLocaleString()}</span>
        </div>
        <button className="delete-btn" onClick={() => handleDeleteTodo(todo.id, isHistory ? 'completed' : 'active')}>
          &times;
        </button>
      </li>
    );
  };

  return (
    <main className="app-container">
      <div className={`card ${isGlassMode ? 'liquidGlass-wrapper' : ''}`}>
        {isGlassMode && (
          <>
            <div className="liquidGlass-effect"></div>
            <div className="liquidGlass-tint"></div>
            <div className="liquidGlass-shine"></div>
          </>
        )}
        <div className="card-content">
          <header className="app-header">
            <button className="glass-switcher" onClick={() => setIsGlassMode(!isGlassMode)} aria-label="Toggle Liquid Glass theme">
              💎
            </button>
            <div className="header-content">
              <h1>My To-Do List</h1>
              <p>What do you need to get done today?</p>
            </div>
            <button className="theme-switcher" onClick={handleThemeChange} aria-label="Switch theme">
              🎨
            </button>
          </header>

          <section>
            <form onSubmit={handleAddTodo} className="add-todo-form">
              <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="Add a new to-do..."/>
              <button type="submit">+</button>
            </form>
          </section>

          <section className="todo-list-section">
            <ul className="todo-list">{todos.map(todo => renderTodoItem(todo))}</ul>
          </section>
          
          {completedTodos.length > 0 && (
            <section className="history-section">
              <h2 className="expandable-header" onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}>
                History <span className={`arrow ${isHistoryExpanded ? 'expanded' : ''}`}>&#9660;</span>
              </h2>
              <div className={`history-list-container ${isHistoryExpanded ? 'expanded' : ''}`}>
                <ul className="todo-list history-list">{completedTodos.map(todo => renderTodoItem(todo, true))}</ul>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
