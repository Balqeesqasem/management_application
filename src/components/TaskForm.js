import React, { useState, useEffect } from 'react';
import '../styles/TaskManager.css'; // Import the CSS file

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [tag, setTag] = useState('back_end');
  const [priority, setPriority] = useState(1);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [error, setError] = useState(''); // State for error messages

  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch tasks with optional filters
  const fetchTasks = async (filters = {}) => {
    try {
      const { status, priority, tag } = filters;
      const query = new URLSearchParams({
        ...(status && { status }),
        ...(priority && { priority }),
        ...(tag && { tag }),
      }).toString();

      const response = await fetch(`http://localhost:3000/tasks?${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
      setError(''); // Clear error message on successful fetch
    } catch (error) {
      setError('Error fetching tasks: ' + error.message);
    }
  };

  // Create a new task
  const createTask = async () => {
    try {
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          status,
          tag,
          priority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors.join(', ') || 'Failed to create task');
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);

      // Reset form fields
      setTitle('');
      setDescription('');
      setStatus('pending');
      setTag('back_end');
      setPriority(1);
      setError(''); // Clear error message on successful creation
    } catch (error) {
      setError('Error creating task: ' + error.message);
    }
  };

  // Update an existing task
  const updateTask = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          status,
          tag,
          priority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors.join(', ') || 'Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
      setEditingTaskId(null);
      setTitle('');
      setDescription('');
      setStatus('pending');
      setTag('back_end');
      setPriority(1);
      setError(''); // Clear error message on successful update
    } catch (error) {
      setError('Error updating task: ' + error.message);
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter((task) => task.id !== id));
      setError(''); // Clear error message on successful deletion
    } catch (error) {
      setError('Error deleting task: ' + error.message);
    }
  };

  // Handle edit form fields
  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setTag(task.tag);
    setPriority(task.priority);
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingTaskId) {
      updateTask(editingTaskId);
    } else {
      createTask();
    }
  };

  // Handle filter form submission
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTasks({
      status: filterStatus,
      priority: filterPriority,
      tag: filterTag,
    });
  };

  return (
    <div className="container">
      <h2 className="header">{editingTaskId ? 'Edit Task' : 'Create a New Task'}</h2>
      {error && <div className="error-message">{error}</div>} {/* Display error message */}


      {/* Task Creation/Editing Form */}
      <form onSubmit={handleFormSubmit} className="form">
        <div className="form-group">
          <label className="label">Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </div>
        <div className="form-group">
          <label className="label">Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="textarea"></textarea>
        </div>
        <div className="form-group">
          <label className="label">Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Tag:</label>
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="select">
            <option value="back_end">Back End</option>
            <option value="front_end">Front End</option>
            <option value="design">Design</option>
            <option value="others">Others</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Priority:</label>
          <input type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} className="input" />
        </div>
        <button type="submit" className="button">{editingTaskId ? 'Update Task' : 'Create Task'}</button>
      </form>

     {/* Filter Form */}
     <form onSubmit={handleFilterSubmit} className="form">
        <div className="form-group">
          <label className="label">Filter Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Filter Tag:</label>
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="select">
            <option value="">All</option>
            <option value="back_end">Back End</option>
            <option value="front_end">Front End</option>
            <option value="design">Design</option>
            <option value="others">Others</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Filter Priority:</label>
          <input
            type="number"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input"
          />
        </div>
        <button type="submit" className="button">Apply Filters</button>
      </form>

      <h2 className="header">Task List</h2>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <strong>{task.title}</strong> - {task.description} (Priority: {task.priority}, Tag: {task.tag}, Status: {task.status})
            <button onClick={() => handleEdit(task)} className="edit-button">Edit</button>
            <button onClick={() => deleteTask(task.id)} className="delete-button">Delete</button>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default TaskManager;
