import { requireLogin } from './auth.js';
import { renderSidebar, renderTopbar, getCategoryColor, showConfirm, showAlert } from './component.js';
import { getNotes, createNote, updateNote, toggleFavorite, trashNote, archiveNote } from './api.js';

const user        = requireLogin();
const MOODS       = ['😍','😭','🤣','😪','😱'];

renderSidebar('all_notes');
const searchInput = renderTopbar('All Notes');

let allNotes  = [];
let editingId = null;

// Load & render
async function loadNotes() {
  showLoading(true);
  try {
    const data = await getNotes(user.user_id);
    allNotes = data.filter(n => !n.is_delete && !n.is_archive);
    renderNotes(allNotes);
  } catch (err) {
    showAlert({ icon: '❌', title: 'Failed to load', message: 'Make sure the backend server is running.' });
  } finally {
    showLoading(false);
  }
}

function renderNotes(notes) {
  const grid       = document.getElementById('notesGrid');
  const emptyState = document.getElementById('emptyState');
  grid.innerHTML   = '';

  if (notes.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
    return;
  }
  emptyState.classList.add('hidden');
  emptyState.classList.remove('flex');
  grid.classList.remove('hidden');
  notes.forEach(note => grid.appendChild(createNoteCard(note)));
}

// Note card
function createNoteCard(note) {
  const { bg, border } = getCategoryColor(note.category);
  const card = document.createElement('div');
  
  card.className = 'note-card rounded-[1.2rem] p-4 flex flex-col gap-1 shadow-sm transition hover:shadow-md cursor-pointer relative';
  card.style.cssText = `background:${bg}; border:1.5px solid ${border};`;

  const finalDate = note.updated_at && note.updated_at !== note.created_at ? note.updated_at : note.created_at;
  const isEdited  = note.updated_at && note.updated_at !== note.created_at;
  const dateStr   = new Date(finalDate).toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  const moodHtml  = note.mood ? `<span class="text-lg leading-none">${note.mood}</span>` : '';

  card.innerHTML = `
    <div class="flex items-center justify-between px-2 mb-1">
      <span class="text-[11px] font-bold uppercase tracking-widest text-gray-600">${note.category || 'Other'}</span>
      <div class="relative">
        <button class="btn-menu p-1 rounded-lg hover:bg-black/10 transition">
          <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </button>
        <div class="dropdown-menu hidden absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-20 w-36 py-1 text-sm">
          <button class="btn-edit w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium">✏️ Edit</button>
          <button class="btn-archive w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium">📦 Archive</button>
          <button class="btn-trash w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500 font-medium">🗑️ Delete</button>
        </div>
      </div>
    </div>

    <div class="main-content bg-white rounded-[0.8rem] p-5 flex flex-col gap-3 shadow-sm flex-1 hover:bg-gray-50/50 transition">
      <div class="flex items-center justify-between gap-3 min-h-[24px]">
        <div class="flex items-center gap-1.5 min-w-0">
          ${moodHtml}
          <h3 class="font-bold text-gray-800 text-sm leading-snug truncate">${escapeHtml(note.title)}</h3>
        </div>
        <button class="btn-fav p-1.5 shrink-0 transition flex items-center justify-center hover:scale-125">
          <svg class="w-4 h-4 ${note.is_favorite ? 'text-red-400 fill-red-400' : 'text-gray-400'}"
            fill="${note.is_favorite ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-1.5 text-[10px] text-gray-400 border-b border-gray-100 pb-2">
        <span>${dateStr}</span>
        ${isEdited ? '<span class="italic font-medium text-violet-400">• Edited</span>' : ''}
      </div>

      <p class="text-sm text-gray-600 line-clamp-3 leading-relaxed">${escapeHtml(note.content || '')}</p>
    </div>
  `;

  // 1. EVENT KLIK MODAL BACA (Area Putih)
  const contentArea = card.querySelector('.main-content');
  contentArea.onclick = (e) => {
    // Jika user klik tombol favorit, jangan buka modal baca
    if (e.target.closest('.btn-fav')) return;
    
    console.log("Try to open modal for:", note.title);
    openReadModal(note);
  };

  // 2. EVENT MENU DROPDOWN
  const btnMenu = card.querySelector('.btn-menu');
  btnMenu.onclick = (e) => {
    e.stopPropagation();
    const dd = card.querySelector('.dropdown-menu');
    document.querySelectorAll('.dropdown-menu').forEach(d => { if (d !== dd) d.classList.add('hidden'); });
    dd.classList.toggle('hidden');
  };

  // 3. EVENT TOMBOL FAVORIT (BIAR NGGAK BUBBLING)
  const btnFav = card.querySelector('.btn-fav');
  btnFav.onclick = async (e) => {
    e.stopPropagation(); // Mencegah modal terbuka saat klik favorit
    await toggleFavorite(note.note_id, user.user_id, note.is_favorite ? 0 : 1);
    loadNotes();
  };

  // 4. EVENT EDIT/ARCHIVE/TRASH
  card.querySelector('.btn-edit').onclick = (e) => { e.stopPropagation(); openModal(note); };
  
  card.querySelector('.btn-archive').onclick = (e) => {
    e.stopPropagation();
    showConfirm({
      icon: '📦', title: 'Archive note?',
      message: `"${note.title}" will be moved to the archive.`,
      confirmText: 'Archive', confirmClass: 'bg-[#9277C0] hover:bg-[#8165AE]',
      onConfirm: async () => { await archiveNote(note.note_id, user.user_id); loadNotes(); }
    });
  };

  card.querySelector('.btn-trash').onclick = (e) => {
    e.stopPropagation();
    showConfirm({
      icon: '🗑️', title: 'Delete note?',
      message: `"${note.title}" will be moved to the trash.`,
      confirmText: 'Delete', confirmClass: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => { await trashNote(note.note_id, user.user_id); loadNotes(); }
    });
  };

  return card;
}
// Read modal
function openReadModal(note) {
  const { bg, border } = getCategoryColor(note.category);
  const finalDate = note.updated_at && note.updated_at !== note.created_at ? note.updated_at : note.created_at;
  const isEdited  = note.updated_at && note.updated_at !== note.created_at;
  const dateStr   = new Date(finalDate).toLocaleString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Set warna accent di read modal sesuai kategori note
  const readModal   = document.getElementById('readModal');
  const readAccent  = document.getElementById('readAccent');
  readAccent.style.cssText = `background:${bg}; border-bottom: 2px solid ${border};`;

  document.getElementById('readMood').textContent     = note.mood || '';
  document.getElementById('readCategory').textContent = note.category || 'Other';
  document.getElementById('readCategory').style.cssText = `background:${bg}; border:1px solid ${border};`;
  document.getElementById('readTitle').textContent    = note.title;
  document.getElementById('readDate').textContent     = dateStr + (isEdited ? ' · Edited' : '');
  document.getElementById('readContent').textContent  = note.content || '';

  // Tombol favorite di read modal
  const favBtn = document.getElementById('readFavBtn');
  favBtn.dataset.fav   = note.is_favorite;
  favBtn.dataset.id    = note.note_id;
  updateReadFavIcon(note.is_favorite);

  // Tombol Edit di read modal langsung buka edit modal
  document.getElementById('readEditBtn').onclick = () => {
    closeReadModal();
    openModal(note);
  };

  readModal.classList.remove('hidden');
}

function updateReadFavIcon(isFav) {
  const favBtn = document.getElementById('readFavBtn');
  favBtn.innerHTML = `
    <svg class="w-5 h-5 ${isFav ? 'text-red-400 fill-red-400' : 'text-gray-400'}"
      fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
    </svg>
    <span class="text-sm font-medium">${isFav ? 'Unfavorite' : 'Favorite'}</span>
  `;
}

function closeReadModal() {
  document.getElementById('readModal').classList.add('hidden');
}

// Favorite toggle dari read modal
document.getElementById('readFavBtn').addEventListener('click', async () => {
  const btn   = document.getElementById('readFavBtn');
  const noteId = Number(btn.dataset.id);
  const isFav  = btn.dataset.fav === '1' || btn.dataset.fav === 'true' || btn.dataset.fav === 1;
  const newVal = isFav ? 0 : 1;
  await toggleFavorite(noteId, user.user_id, newVal);
  btn.dataset.fav = newVal;
  updateReadFavIcon(newVal);
  loadNotes();
});

document.getElementById('readCloseBtn').addEventListener('click', closeReadModal);
document.getElementById('readModal').addEventListener('click', e => {
  if (e.target === document.getElementById('readModal')) closeReadModal();
});

// Create / edit modal
let selectedMood = null;

function openModal(note) {
  editingId    = note ? note.note_id : null;
  selectedMood = note ? (note.mood || null) : null;

  document.getElementById('modalTitle').textContent = note ? 'Edit Note' : 'Create New Note';
  document.getElementById('modalBadge').textContent = note ? 'Edited' : 'Draft';
  document.getElementById('modalBadge').className   = note
    ? 'text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-600'
    : 'text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-600';
  document.getElementById('inputTitle').value          = note?.title    ?? '';
  document.getElementById('inputContent').value        = note?.content  ?? '';
  document.getElementById('inputCategory').value       = note?.category ?? 'Other';
  document.getElementById('modalError').classList.add('hidden');

  renderMoodPicker(selectedMood);
  document.getElementById('noteModal').classList.remove('hidden');
}

function renderMoodPicker(currentMood) {
  const container = document.getElementById('moodPicker');
  container.innerHTML = MOODS.map(m => `
    <button type="button" data-mood="${m}"
      class="mood-btn text-2xl p-1.5 rounded-xl transition hover:scale-110
             ${currentMood === m ? 'bg-violet-100 ring-2 ring-violet-400 scale-110' : 'hover:bg-gray-100'}">
      ${m}
    </button>
  `).join('');

  container.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMood = selectedMood === btn.dataset.mood ? null : btn.dataset.mood;
      renderMoodPicker(selectedMood);
    });
  });
}

function closeModal() {
  document.getElementById('noteModal').classList.add('hidden');
  editingId = null;
  selectedMood = null;
}

document.getElementById('btnCancelModal').addEventListener('click', closeModal);
document.getElementById('noteModal').addEventListener('click', e => {
  if (e.target === document.getElementById('noteModal')) closeModal();
});

document.getElementById('btnSaveModal').addEventListener('click', async () => {
  const title    = document.getElementById('inputTitle').value.trim();
  const content  = document.getElementById('inputContent').value.trim();
  const category = document.getElementById('inputCategory').value;

  if (!title) { document.getElementById('modalError').classList.remove('hidden'); return; }

  try {
    if (editingId) {
      await updateNote(editingId, user.user_id, { title, content, category, mood: selectedMood });
    } else {
      await createNote({ user_id: user.user_id, title, content, category, mood: selectedMood });
    }
    closeModal();
    loadNotes();
  } catch (err) {
    showAlert({ icon: '❌', title: 'Failed to save', message: err.message });
  }
});

// FAB create new note
document.getElementById('btnNewNote').addEventListener('click', () => openModal(null));

// Search
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    renderNotes(allNotes.filter(n =>
      n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
    ));
  });
}

// Tutup dropdown saat klik luar
document.addEventListener('click', () =>
  document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.add('hidden'))
);

function showLoading(show) {
  document.getElementById('loadingState').classList.toggle('hidden', !show);
}
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

loadNotes();