import { getUser, logout } from './auth.js';

// Category colors
export const CATEGORY_COLORS = {
  College:  { bg: '#F6CECE', border: '#f0a0a0' }, // merah muda
  Work:     { bg: '#FFF1CE', border: '#f5cc4a' }, // kuning
  Personal: { bg: '#D0E1CB', border: '#86efac' }, // hijau
  Idea:     { bg: '#DDD6FE', border: '#c4b5fd' }, // ungu
  Other:    { bg: '#C4E5F2', border: '#7dd3fc' }, // biru
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || { bg: '#d8dce6', border: '#d1d5db' };
}

// Popup System
function ensurePopupContainer() {
  if (document.getElementById('popupContainer')) return;
  const el = document.createElement('div');
  el.id = 'popupContainer';
  el.className = 'fixed inset-0 z-[999] flex items-center justify-center hidden';
  el.innerHTML = `
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" id="popupBackdrop"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
      <div id="popupIcon" class="text-4xl mb-3"></div>
      <h3 id="popupTitle" class="text-base font-bold text-gray-800 mb-1"></h3>
      <p id="popupMessage" class="text-sm text-gray-500 mb-5"></p>
      <div id="popupButtons" class="flex gap-3"></div>
    </div>
  `;
  document.body.appendChild(el);
}

export function showConfirm({ icon = '❓', title = 'Are you sure?', message = '', confirmText = 'Yes', confirmClass = 'bg-red-500 hover:bg-red-600', onConfirm }) {
  ensurePopupContainer();
  const container = document.getElementById('popupContainer');
  document.getElementById('popupIcon').textContent    = icon;
  document.getElementById('popupTitle').textContent   = title;
  document.getElementById('popupMessage').textContent = message;
  document.getElementById('popupButtons').innerHTML   = `
    <button id="popupCancel"  class="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
    <button id="popupConfirm" class="flex-1 ${confirmClass} text-white font-semibold py-2.5 rounded-xl text-sm transition">${confirmText}</button>
  `;
  container.classList.remove('hidden');
  const close = () => container.classList.add('hidden');
  document.getElementById('popupCancel').onclick   = close;
  document.getElementById('popupBackdrop').onclick = close;
  document.getElementById('popupConfirm').onclick  = () => { close(); onConfirm(); };
}

export function showAlert({ icon = 'ℹ️', title = 'Info', message = '', onClose }) {
  ensurePopupContainer();
  const container = document.getElementById('popupContainer');
  document.getElementById('popupIcon').textContent    = icon;
  document.getElementById('popupTitle').textContent   = title;
  document.getElementById('popupMessage').textContent = message;
  document.getElementById('popupButtons').innerHTML   = `
    <button id="popupConfirm" class="flex-1 bg-[#9277C0] hover:bg-[#8165AE] text-white font-semibold py-2.5 rounded-xl text-sm transition">OK</button>
  `;
  container.classList.remove('hidden');
  const close = () => { container.classList.add('hidden'); if (onClose) onClose(); };
  document.getElementById('popupBackdrop').onclick = close;
  document.getElementById('popupConfirm').onclick  = close;
}

// Upgrade Pro Modal
function ensureUpgradeModal() {
  if (document.getElementById('upgradeModal')) return;
  const el = document.createElement('div');
  el.id = 'upgradeModal';
  el.className = 'fixed inset-0 z-[998] flex items-center justify-center hidden';
  el.innerHTML = `
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" id="upgradeBackdrop"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
      <div class="bg-gradient-to-br from-[#b07fe0] to-[#6c3aad] px-6 pt-8 pb-10 text-center">
        <div class="text-5xl mb-2">⭐</div>
        <h2 class="text-xl font-bold text-white mb-1">Pastel Note Pro</h2>
        <p class="text-white/80 text-sm">Unlock all features</p>
      </div>
      <div class="flex justify-center -mt-5 mb-4">
        <div class="bg-[#E2B93B] text-white font-bold px-6 py-2 rounded-full text-sm shadow-md">Rp 29.000 / month</div>
      </div>
      <div class="px-6 pb-2 space-y-2">
        ${['Unlimited notes','Priority support','Custom categories','Export to PDF','Dark mode','Cloud sync'].map(f => `
          <div class="flex items-center gap-2 text-sm text-gray-700"><span class="text-green-500 font-bold">✓</span> ${f}</div>
        `).join('')}
      </div>
      <div class="px-6 py-5 space-y-2">
        <button id="btnUpgradeNow" class="w-full bg-[#E2B93B] hover:bg-[#d4a82e] text-white font-semibold py-3 rounded-xl text-sm transition shadow-md">Upgrade Now 🚀</button>
        <button id="btnUpgradeClose" class="w-full text-gray-400 text-xs py-1 hover:text-gray-600 transition">Maybe later</button>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  const close = () => el.classList.add('hidden');
  document.getElementById('upgradeBackdrop').onclick = close;
  document.getElementById('btnUpgradeClose').onclick = close;
  document.getElementById('btnUpgradeNow').onclick   = () => {
    close();
    showAlert({ icon: '🎉', title: 'Coming Soon!', message: 'The upgrade feature will be available soon. Thanks for your interest!' });
  };
}

export function openUpgradeModal() {
  ensureUpgradeModal();
  document.getElementById('upgradeModal').classList.remove('hidden');
}

// Sidebar
export function renderSidebar(activePage) {
  const el = document.getElementById('sidebar');
  if (!el) return;

  const navItems = [
    { key: 'all_notes', label: 'All Notes', href: 'all_notes.html', icon: iconChart() },
    { key: 'favorites', label: 'Favorites', href: 'favorites.html', icon: iconFavorite() },
    { key: 'archive',   label: 'Archive',   href: 'archive.html',   icon: iconArchive() },
    { key: 'trash',     label: 'Trash',     href: 'trash.html',     icon: iconTrash() },
  ];

  el.innerHTML = `
    <div class="flex flex-col h-full">
      <div class="px-6 pt-6 pb-8">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
          <span class="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
          <span class="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
        </div>
        <a href="all_notes.html" class="block">
          <h1 class="text-xl font-bold text-gray-800 mt-3 hover:text-[#9277C0] transition">Pastel Note</h1>
        </a>
      </div>

      <nav class="flex-1 px-3 space-y-1">
        ${navItems.map(item => `
          <a href="${item.href}"
             class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
                    ${activePage === item.key
                      ? 'bg-[#EDE9FE] text-[#6D28D9]'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}">
            ${item.icon}
            ${item.label}
          </a>
        `).join('')}
      </nav>

      <div class="px-5 pb-6">
        <div class="bg-gray-50 rounded-2xl p-4 text-center mb-4">
          <p class="text-xs text-gray-500 mb-3">Want to access unlimited notes taking experience & lots of features?</p>
          <div class="flex justify-center mb-3">
            <img src="../assets/upgrade.png" alt="" class="w-20 h-auto" onerror="this.style.display='none'"/>
          </div>
        </div>
        <button id="btnUpgradePro"
          class="w-full bg-[#E2B93B] hover:bg-[#d4a82e] text-white font-semibold py-2.5 rounded-xl text-sm transition">
          Upgrade Pro
        </button>
      </div>
    </div>
  `;

  document.getElementById('btnUpgradePro').addEventListener('click', openUpgradeModal);
}

// Topbar
export function renderTopbar(pageTitle) {
  const el = document.getElementById('topbar');
  if (!el) return;
  const user = getUser();

  el.innerHTML = `
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-[#9277C0] flex items-center justify-center text-white font-bold text-sm">
          ${user ? user.username.charAt(0).toUpperCase() : '?'}
        </div>
        <div class="leading-tight">
          <p class="text-sm font-semibold text-gray-800">${user ? user.username : '-'}</p>
          <p class="text-xs text-gray-400">${user ? user.email : ''}</p>
        </div>
      </div>

      <h2 class="text-lg font-bold text-gray-800">${pageTitle}</h2>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white w-52">
          <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z"/>
          </svg>
          <input id="searchInput" type="text" placeholder="Search a note"
            class="text-sm text-gray-700 outline-none bg-transparent w-full placeholder-gray-400"/>
        </div>
        <button id="logoutBtn" title="Logout"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    showConfirm({
      icon: '👋', title: 'Logout?',
      message: 'You will be signed out of Pastel Note.',
      confirmText: 'Logout', confirmClass: 'bg-red-500 hover:bg-red-600',
      onConfirm: logout,
    });
  });

  return document.getElementById('searchInput');
}

// SVG Icons
function iconChart() {
  return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`;
}
function iconFavorite() {
  return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`;
}
function iconArchive() {
  return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>`;
}
function iconTrash() {
  return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;
}