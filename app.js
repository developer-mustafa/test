
// DOM Elements
const todoInput = document.getElementById('todoInput');
const dueDate = document.getElementById('dueDate');
const dueTime = document.getElementById('dueTime');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');

// Dashboard elements
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');
const progressPercent = document.getElementById('progressPercent');
const progressMessage = document.getElementById('progressMessage');

// Theme toggle
const themeToggle = document.getElementById('themeToggle');

// Modals
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const closeEditModal = document.getElementById('closeEditModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');

// Modal buttons
const cancelEdit = document.getElementById('cancelEdit');
const saveEdit = document.getElementById('saveEdit');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

// Modal inputs
const editText = document.getElementById('editText');
const editDate = document.getElementById('editDate');
const editTime = document.getElementById('editTime');

// Loader
const loader = document.getElementById('loader');

// Audio
const addSound = document.getElementById('addSound');
const completeSound = document.getElementById('completeSound');
const deleteSound = document.getElementById('deleteSound');

// State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentEditIndex = null;
let currentDeleteIndex = null;

// Initialize the app
function init() {
  renderTodos();
  setupEventListeners();
  setDefaultDateTime();
}

// Set default date and time (today and current time + 1 hour)
function setDefaultDateTime() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(now.getHours() + 1);
  
  const dateStr = tomorrow.toISOString().split('T')[0];
  const timeStr = tomorrow.toTimeString().substring(0, 5);
  
  dueDate.value = dateStr;
  dueTime.value = timeStr;
}

// Format date and time for display
function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return 'No deadline';
  
  const date = new Date(`${dateStr}T${timeStr || '00:00'}`);
  const options = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('en-US', options);
}

// Show loader
function showLoader() {
  loader.classList.add('active');
}

// Hide loader
function hideLoader() {
  loader.classList.remove('active');
}

// Simulate loading (for demo purposes)
function simulateLoading() {
  showLoader();
  setTimeout(hideLoader, 800);
}

// Render todos to the DOM
function renderTodos() {
  simulateLoading();
  
  // Clear the list
  todoList.innerHTML = '';
  
  // Update dashboard stats
  updateDashboard();
  
  // Show empty state if no todos
  if (todos.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Render each todo
  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    li.innerHTML = `
      <div class="todo-content">
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
        <div class="todo-text ${todo.completed ? 'completed' : ''}">
          ${todo.text}
          <div class="todo-due">
            <i class="far fa-clock"></i>
            ${formatDateTime(todo.date, todo.time)}
          </div>
        </div>
      </div>
      <div class="todo-actions">
        <button class="edit-btn" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    // Add event listeners to the buttons
    const checkbox = li.querySelector('.todo-checkbox');
    const editBtn = li.querySelector('.edit-btn');
    const deleteBtn = li.querySelector('.delete-btn');
    
    checkbox.addEventListener('click', () => toggleComplete(index));
    editBtn.addEventListener('click', () => openEditModal(index));
    deleteBtn.addEventListener('click', () => openDeleteModal(index));
    
    todoList.appendChild(li);
  });
  
  // Save to localStorage
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Update dashboard statistics
function updateDashboard() {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const pending = total - completed;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  totalCount.textContent = total;
  completedCount.textContent = completed;
  pendingCount.textContent = pending;
  progressPercent.textContent = `${progress}%`;
  
  // Set progress message and color
  if (progress === 100) {
    progressMessage.textContent = 'Perfect!';
    progressPercent.style.color = 'var(--success)';
  } else if (progress >= 75) {
    progressMessage.textContent = 'Great job!';
    progressPercent.style.color = 'var(--success)';
  } else if (progress >= 50) {
    progressMessage.textContent = 'Good progress';
    progressPercent.style.color = 'var(--warning)';
  } else if (progress > 0) {
    progressMessage.textContent = 'Keep going';
    progressPercent.style.color = 'var(--warning)';
  } else {
    progressMessage.textContent = 'Start your journey';
    progressPercent.style.color = 'var(--danger)';
  }
}

// Add a new todo
function addTodo() {
  const text = todoInput.value.trim();
  const date = dueDate.value;
  const time = dueTime.value;
  
  if (!text) {
    alert('Please enter a task description');
    return;
  }
  
  const newTodo = {
    text,
    date,
    time,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.unshift(newTodo);
  todoInput.value = '';
  setDefaultDateTime();
  
  // Play sound and render
  addSound.play();
  renderTodos();
}

// Toggle todo completion status
function toggleComplete(index) {
  todos[index].completed = !todos[index].completed;
  completeSound.play();
  renderTodos();
}

// Open edit modal
function openEditModal(index) {
  currentEditIndex = index;
  const todo = todos[index];
  
  editText.value = todo.text;
  editDate.value = todo.date || '';
  editTime.value = todo.time || '';
  
  editModal.classList.add('active');
}

// Save edited todo
function saveEditedTodo() {
  const text = editText.value.trim();
  const date = editDate.value;
  const time = editTime.value;
  
  if (!text) {
    alert('Task description cannot be empty');
    return;
  }
  
  todos[currentEditIndex].text = text;
  todos[currentEditIndex].date = date;
  todos[currentEditIndex].time = time;
  
  editModal.classList.remove('active');
  renderTodos();
}

// Open delete confirmation modal
function openDeleteModal(index) {
  currentDeleteIndex = index;
  deleteModal.classList.add('active');
}

// Confirm deletion
function confirmDeletion() {
  todos.splice(currentDeleteIndex, 1);
  deleteModal.classList.remove('active');
  deleteSound.play();
  renderTodos();
}

// Setup event listeners
function setupEventListeners() {
  // Add todo
  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Edit modal
  saveEdit.addEventListener('click', saveEditedTodo);
  cancelEdit.addEventListener('click', () => editModal.classList.remove('active'));
  closeEditModal.addEventListener('click', () => editModal.classList.remove('active'));
  
  // Delete modal
  confirmDelete.addEventListener('click', confirmDeletion);
  cancelDelete.addEventListener('click', () => deleteModal.classList.remove('active'));
  closeDeleteModal.addEventListener('click', () => deleteModal.classList.remove('active'));
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === editModal) editModal.classList.remove('active');
    if (e.target === deleteModal) deleteModal.classList.remove('active');
  });
}

// Toggle between light and dark theme
function toggleTheme() {
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
  
  const isDark = document.body.classList.contains('dark');
  themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  
  // Save theme preference
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Check for saved theme preference
function checkSavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.classList.add(savedTheme);
  
  themeToggle.innerHTML = savedTheme === 'dark' 
    ? '<i class="fas fa-moon"></i>' 
    : '<i class="fas fa-sun"></i>';
}

// Initialize the app
checkSavedTheme();
init();
