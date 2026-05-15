// ============================================
// Paws & Peace Core - Enhanced App.js
// Version: 1.0.0
// ============================================

let allTasks = [];
let allUsers = [];
let currentUserXP = {};
let activeFilters = {
  category: 'all',
  role: 'all'
};

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  console.log('🐾 Paws & Peace initializing...');
  
  allTasks = await loadTasks();
  allUsers = await loadUsers();
  
  // Load XP from localStorage, merge with users.json defaults
  currentUserXP = loadXPFromStorage();
  
  renderTasks(allTasks);
  renderUsers(allUsers);
  loadProtocolList();
  
  setupCategoryFilters(allTasks);
  setupRoleFilters(allTasks);
  
  console.log('✅ Paws & Peace ready!');
}

// ============================================
// DATA LOADING
// ============================================

async function loadTasks() {
  try {
    const response = await fetch('../data/tasks.json');
    const data = await response.json();
    console.log('📋 Tasks loaded:', data.tasks.length);
    return data.tasks || [];
  } catch (error) {
    console.error('❌ Error loading tasks:', error);
    return [];
  }
}

async function loadUsers() {
  try {
    const response = await fetch('../data/users.json');
    const data = await response.json();
    console.log('👥 Users loaded:', data.users.length);
    return data.users || [];
  } catch (error) {
    console.error('❌ Error loading users:', error);
    return [];
  }
}

async function loadCategories() {
  try {
    const response = await fetch('../data/categories.json');
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('❌ Error loading categories:', error);
    return [];
  }
}

// ============================================
// XP SYSTEM (localStorage)
// ============================================

function loadXPFromStorage() {
  const stored = localStorage.getItem('pawsAndPeaceXP');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Initialize from users.json
  const xpMap = {};
  allUsers.forEach(user => {
    xpMap[user.id] = user.xp || 0;
  });
  
  saveXPToStorage(xpMap);
  return xpMap;
}

function saveXPToStorage(xpMap) {
  localStorage.setItem('pawsAndPeaceXP', JSON.stringify(xpMap));
}

function addXP(userId, amount) {
  if (!currentUserXP[userId]) {
    currentUserXP[userId] = 0;
  }
  currentUserXP[userId] += amount;
  saveXPToStorage(currentUserXP);
  console.log(`✨ +${amount} XP for ${userId} (Total: ${currentUserXP[userId]})`);
  renderUsers(allUsers);
}

// ============================================
// TASK RENDERING
// ============================================

function renderTasks(tasks) {
  const taskList = document.getElementById('task-list');
  if (!taskList) return;
  
  taskList.innerHTML = '';
  
  if (tasks.length === 0) {
    taskList.innerHTML = '<p style="text-align: center; color: #666;">No tasks match your filters.</p>';
    return;
  }
  
  tasks.forEach(task => {
    const taskEl = createTaskElement(task);
    taskList.appendChild(taskEl);
  });
}

function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = 'task-card';
  div.id = `task-${task.id}`;
  
  const rolesDisplay = (task.assignedtoroles || []).join(', ') || 'Unassigned';
  const xpReward = task.xp || 10;
  const groupBonus = task.groupbonus ? `+${task.groupbonus}% group bonus` : '';
  
  div.innerHTML = `
    <div class="task-header">
      <h3>${task.name}</h3>
      <span class="task-xp">+${xpReward} XP ${groupBonus}</span>
    </div>
    <p class="task-description">${task.description || 'No description'}</p>
    <div class="task-meta">
      <span class="task-domain">${task.domain || 'general'}</span>
      <span class="task-roles">${rolesDisplay}</span>
    </div>
    <div class="task-actions">
      <button class="btn-complete" onclick="completeTask('${task.id}', ${xpReward})">
        ✓ Complete
      </button>
      ${task.protocol ? `<button class="btn-protocol" onclick="loadProtocol('${task.protocol}')">📘 Protocol</button>` : ''}
    </div>
  `;
  
  return div;
}

function completeTask(taskId, xp) {
  // In a real system, this would assign to a user
  // For now, we'll add XP to a default user or prompt for selection
  const userId = prompt('Enter your user ID (e.g., martin, selah, carole):', 'martin');
  
  if (userId && allUsers.find(u => u.id === userId)) {
    addXP(userId, xp);
    console.log(`✅ Task ${taskId} completed by ${userId}`);
    // Could mark task as completed in localStorage here
  } else {
    alert('User not found!');
  }
}

// ============================================
// USER/LEADERBOARD RENDERING
// ============================================

function renderUsers(users) {
  const userList = document.getElementById('user-list');
  if (!userList) return;
  
  userList.innerHTML = '';
  
  // Sort by XP (descending)
  const sortedUsers = [...users].sort((a, b) => {
    const xpA = currentUserXP[a.id] || 0;
    const xpB = currentUserXP[b.id] || 0;
    return xpB - xpA;
  });
  
  sortedUsers.forEach((user, index) => {
    const xp = currentUserXP[user.id] || 0;
    const rolesDisplay = (user.roles || []).join(', ');
    const activeClass = user.active ? 'active' : 'inactive';
    
    const userEl = document.createElement('div');
    userEl.className = `user-card ${activeClass}`;
    userEl.innerHTML = `
      <div class="user-rank">#${index + 1}</div>
      <div class="user-info">
        <h4>${user.name}</h4>
        <p class="user-roles">${rolesDisplay}</p>
      </div>
      <div class="user-xp">
        <span class="xp-value">${xp}</span>
        <span class="xp-label">XP</span>
      </div>
    `;
    userList.appendChild(userEl);
  });
}

// ============================================
// CATEGORY FILTERS
// ============================================

function setupCategoryFilters(tasks) {
  const buttons = document.querySelectorAll('.cat-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      activeFilters.category = category;
      
      // Update active button
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Apply combined filters
      applyFilters(tasks);
    });
  });
  
  // Set "All" as default active
  if (buttons.length > 0) {
    buttons[0].classList.add('active');
  }
}

// ============================================
// ROLE FILTERS
// ============================================

function setupRoleFilters(tasks) {
  const buttons = document.querySelectorAll('.role-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      activeFilters.role = role;
      
      // Update active button
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Apply combined filters
      applyFilters(tasks);
    });
  });
  
  // Set "All Roles" as default active
  if (buttons.length > 0) {
    buttons[0].classList.add('active');
  }
}

// ============================================
// COMBINED FILTERING
// ============================================

function applyFilters(tasks) {
  let filtered = tasks;
  
  // Filter by category
  if (activeFilters.category !== 'all') {
    filtered = filtered.filter(t => t.domain === activeFilters.category);
  }
  
  // Filter by role
  if (activeFilters.role !== 'all') {
    filtered = filtered.filter(t => {
      return t.assignedtoroles && t.assignedtoroles.includes(activeFilters.role);
    });
  }
  
  renderTasks(filtered);
}

// ============================================
// PROTOCOL MANAGEMENT
// ============================================

async function loadProtocolList() {
  try {
    const response = await fetch('../docs/protocols/');
    // Note: GitHub Pages may not list directories
    // Fallback: hardcode protocol list or load from JSON
    console.log('📚 Protocol list loaded');
  } catch (error) {
    console.error('❌ Error loading protocol list:', error);
  }
}

function loadProtocol(protocolName) {
  const path = `../docs/protocols/${protocolName}.md`;
  window.open(path, '_blank');
  console.log(`📖 Opening protocol: ${protocolName}`);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getUser(userId) {
  return allUsers.find(u => u.id === userId);
}

function getUsersByRole(role) {
  return allUsers.filter(u => u.roles && u.roles.includes(role));
}

function getTasksByCategory(category) {
  return allTasks.filter(t => t.domain === category);
}

function getTasksByRole(role) {
  return allTasks.filter(t => t.assignedtoroles && t.assignedtoroles.includes(role));
}

// ============================================
// START APP ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', init);
