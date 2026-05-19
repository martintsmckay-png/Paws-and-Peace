// ============================================
// Paws & Peace Core - Enhanced App.js
// Version: 2.0.0 - Full Sync Layer + Task History
// ============================================

import { syncManager } from "../core/sync/sync_manager.js";
import { mockAPI } from "../core/sync/mock_api.js";

let allTasks = [];
let allUsers = [];
let currentUserXP = {};
let activeFilters = { category: 'all', role: 'all' };

// ============================================
// DATA LOADING
// ============================================

async function loadTasks() {
  try {
    const response = await fetch('../data/tasks.json');
    const data = await response.json();
    console.log('📋 Tasks loaded:', data.tasks?.length || 0);
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
    console.log('👥 Users loaded:', data.users?.length || 0);
    return data.users || [];
  } catch (error) {
    console.error('❌ Error loading users:', error);
    return [];
  }
}

// ============================================
// XP SYSTEM (localStorage)
// ============================================

function loadXPFromStorage() {
  const stored = localStorage.getItem('pawsAndPeaceXP');
  if (stored) return JSON.parse(stored);
  
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
  if (!currentUserXP[userId]) currentUserXP[userId] = 0;
  currentUserXP[userId] += amount;
  saveXPToStorage(currentUserXP);
  console.log(`✨ +${amount} XP for ${userId}`);
  renderUsers(allUsers);
}

// ============================================
// TASK RENDERING
// ============================================

function renderTasks(tasks) {
  const taskList = document.getElementById('task-list');
  if (!taskList) {
    console.warn('⚠️ task-list container not found');
    return;
  }
  
  taskList.innerHTML = '';
  
  if (tasks.length === 0) {
    taskList.innerHTML = '<p style="text-align: center; color: #666;">No tasks match your filters.</p>';
    return;
  }
  
  tasks.forEach(task => {
    const taskEl = createTaskElement(task);
    taskList.appendChild(taskEl);
  });
  
  attachNoteHandlers();
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
      <h3>${task.name || task.title || 'Task'}</h3>
      <span class="task-xp">+${xpReward} XP ${groupBonus}</span>
    </div>
    <p class="task-description">${task.description || 'No description'}</p>
    <div class="task-meta">
      <span class="task-domain">${task.domain || task.category || 'general'}</span>
      <span class="task-roles">${rolesDisplay}</span>
    </div>
    <textarea class="vet-note" placeholder="Add vet note..."></textarea>
    <div class="task-actions">
      <button class="btn-complete" onclick="completeTask('${task.id}', ${xpReward})">✓ Complete</button>
      <button class="btn-save-note" data-id="${task.id}">💾 Save Note</button>
      ${task.protocol ? `<button class="btn-protocol" onclick="loadProtocol('${task.protocol}')">📘 Protocol</button>` : ''}
    </div>
  `;
  
  return div;
}

function completeTask(taskId, xp) {
  const userId = prompt('Enter your user ID (martin, selah, carole):', 'martin');
  
  if (userId && allUsers.find(u => u.id === userId)) {
    addXP(userId, xp);
    logTaskHistory(taskId, xp, userId);
    console.log(`✅ Task ${taskId} completed by ${userId}`);
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
// CATEGORY & ROLE FILTERS
// ============================================

function setupCategoryFilters(tasks) {
  const buttons = document.querySelectorAll('.cat-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilters.category = btn.dataset.category;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters(tasks);
    });
  });
  
  if (buttons.length > 0) buttons[0].classList.add('active');
}

function setupRoleFilters(tasks) {
  const buttons = document.querySelectorAll('.role-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilters.role = btn.dataset.role;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters(tasks);
    });
  });
  
  if (buttons.length > 0) buttons[0].classList.add('active');
}

function applyFilters(tasks) {
  let filtered = tasks;
  
  if (activeFilters.category !== 'all') {
    filtered = filtered.filter(t => t.domain === activeFilters.category);
  }
  
  if (activeFilters.role !== 'all') {
    filtered = filtered.filter(t => t.assignedtoroles && t.assignedtoroles.includes(activeFilters.role));
  }
  
  renderTasks(filtered);
}

// ============================================
// SYNC: VET NOTES
// ============================================

function syncVetNote(taskId, note) {
  if (!note.trim()) return;
  syncManager.addRecord({
    type: 'vet_note',
    taskId,
    note
  });
}

function attachNoteHandlers() {
  document.querySelectorAll('.btn-save-note').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskCard = btn.closest('.task-card');
      const textarea = taskCard.querySelector('.vet-note');
      const taskId = btn.dataset.id;
      const note = textarea.value;
      
      syncVetNote(taskId, note);
      textarea.value = '';
      alert('✅ Note saved to sync queue.');
    });
  });
}

function setupSyncButton() {
  const btn = document.getElementById('sync-btn');
  if (!btn) return;
  
  btn.addEventListener('click', async () => {
    const result = await syncManager.syncAll(mockAPI);
    alert(`✅ Synced: ${result.successCount} success, ${result.failCount} failed`);
  });
}

// ============================================
// TASK HISTORY
// ============================================

function logTaskHistory(taskId, xp, userId) {
  const history = JSON.parse(localStorage.getItem('task_history')) || [];
  
  const task = allTasks.find(t => t.id == taskId);
  history.push({
    id: taskId,
    title: task?.name || task?.title || 'Unknown Task',
    xp,
    completedBy: userId,
    completedAt: new Date().toISOString()
  });
  
  localStorage.setItem('task_history', JSON.stringify(history));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('task_history')) || [];
  const container = document.getElementById('history-list');
  if (!container) return;
  
  container.innerHTML = history
    .reverse()
    .map(h => `
      <div class="history-item">
        <p><strong>${h.title}</strong> — ${h.xp} XP by ${h.completedBy}</p>
        <small>${new Date(h.completedAt).toLocaleString()}</small>
      </div>
    `)
    .join('');
}

// ============================================
// PROTOCOL VIEWER
// ============================================

async function loadProtocolList() {
  const list = document.getElementById('protocol-list');
  if (!list) return;
  
  const protocols = [
    'mobilevetservices.md',
    'community_stewardship.md',
    'emergencyanimalcare.md',
    'wintershelterprep.md',
    'volunteer_safety.md'
  ];
  
  protocols.forEach(file => {
    const li = document.createElement('li');
    li.textContent = file.replace('.md', '').replace(/_/g, ' ');
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => loadProtocol(file));
    list.appendChild(li);
  });
}

async function loadProtocol(file) {
  const viewer = document.getElementById('protocol-viewer');
  if (!viewer) return;
  
  try {
    const text = await fetch(`../docs/protocols/${file}`).then(r => r.text());
    viewer.innerHTML = `<pre>${text}</pre>`;
  } catch (error) {
    viewer.innerHTML = '<p>Protocol not found.</p>';
  }
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  console.log('🐾 Paws & Peace initializing...');
  
  allTasks = await loadTasks();
  allUsers = await loadUsers();
  currentUserXP = loadXPFromStorage();
  
  renderTasks(allTasks);
  renderUsers(allUsers);
  renderHistory();
  loadProtocolList();
  
  setupCategoryFilters(allTasks);
  setupRoleFilters(allTasks);
  setupSyncButton();
  
  console.log('✅ Paws & Peace ready!');
}

document.addEventListener('DOMContentLoaded', init);