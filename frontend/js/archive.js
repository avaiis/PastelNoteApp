import { requireLogin } from './auth.js';
import { renderSidebar, renderTopbar, getCategoryColor, showConfirm, showAlert } from './component.js';
import { getNotes, restoreNote, trashNote, updateNote } from './api.js';

const user = requireLogin();
renderSidebar('archive');
const searchInput = renderTopbar('Archive');

let allNotes  = [];
let editingId = null;

async function loadNotes() {
  showLoading(true);
  try {
    const data = await getNotes(user.user_id);
    allNotes = data.filter(n => n.is_archive && !n.is_delete);
    renderNotes(allNotes);
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

function createNoteCard(note) {
  const { bg, border } = getCategoryColor(note.category);
  const card = document.createElement('div');
  card.className = 'rounded-[1.2rem] p-4 flex flex-col gap-1 shadow-sm transition hover:shadow-md opacity-90 hover:opacity-100 cursor-pointer relative';
  card.style.cssText = `background:${bg}; border:1.5px solid ${border};`;

  const dateStr = new Date(note.created_at).toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  const moodHtml = note.mood ? `<span class="text-lg leading-none">${note.mood}</span>` : '';

  card.innerHTML = `
    <div class="flex items-center justify-between px-2">
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-bold uppercase tracking-widest text-gray-600">${note.category || 'Other'}</span>
        <span class="text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">ARCHIVED</span>
      </div>
      <div class="relative">
        <button class="btn-menu p-1 rounded-lg hover:bg-black/10 transition">
          <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </button>
        <div class="dropdown-menu hidden absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-10 w-40 py-1 text-sm">
          <button class="btn-edit w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium">✏️ Edit</button>
          <button class="btn-unarchive w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium">📤 Unarchive</button>
          <button class="btn-trash w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500 font-medium">🗑️ Delete</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-[0.8rem] p-5 flex flex-col gap-3 shadow-sm flex-1">
      <div class="flex items-center gap-1.5 min-w-0 min-h-[24px]">
        ${moodHtml}
        <h3 class="font-bold text-gray-800 text-sm leading-snug truncate">${escapeHtml(note.title)}</h3>
      </div>
      <p class="text-[10px] text-gray-400 flex items-center gap-1 border-b border-gray-80 pb-2">
        <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        ${dateStr}
      </p>
      <p class="text-sm text-gray-600 line-clamp-3 leading-relaxed">${escapeHtml(note.content || '')}</p>
    </div>
  `;

  card.querySelector('.btn-menu').addEventListener('click', e => {
    e.stopPropagation();
    const dd = card.querySelector('.dropdown-menu');
    document.querySelectorAll('.dropdown-menu').forEach(d => { if (d !== dd) d.classList.add('hidden'); });
    dd.classList.toggle('hidden');
  });

  card.querySelector('.btn-edit').addEventListener('click', e => { e.stopPropagation(); openModal(note); });

  card.querySelector('.btn-unarchive').addEventListener('click', e => {
    e.stopPropagation();
    showConfirm({ 
      icon: '📤', 
      title: 'Unarchive note?', 
      message: `"${note.title}" will be moved back to All Notes.`,
      confirmText: 'Unarchive', 
      confirmClass: 'bg-[#9277C0] hover:bg-[#8165AE]',
      onConfirm: async () => { 
        try{
          await restoreNote(note.note_id, user.user_id); 
          loadNotes();
          showAlert({ icon: '✅', title: 'Unarchived', message: 'Note succesfully unarchived!'});
        }catch(err){
          showAlert({ icon: '❌', title: 'Failed to unarchived', message: err.message });
        }   
      }
    });
  });

  card.querySelector('.btn-trash').addEventListener('click', e => {
    e.stopPropagation();
    showConfirm({ 
      icon: '🗑️', 
      title: 'Delete note?', 
      message: `"${note.title}" will be moved to the trash.`,
      confirmText: 'Delete', 
      confirmClass: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => { 
        try{
          await trashNote(note.note_id, user.user_id); 
          loadNotes();
          showAlert({ icon: '✅', title: 'Deleted', message: 'Note moved to trash!' });
        }catch(err){
          showAlert({ icon: '❌', title: 'Error', message: err.message });
        }
        
      }
    });
  });

  return card;
}

// Modal edit
const MOODS      = ['😍','😭','🤣','😪','😱'];
let selectedMood = null;

function openModal(note) {
  editingId    = note.note_id;
  selectedMood = note.mood || null;
  document.getElementById('inputTitle').value    = note.title    ?? '';
  document.getElementById('inputContent').value  = note.content  ?? '';
  document.getElementById('inputCategory').value = note.category ?? 'College';
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
  editingId = null; selectedMood = null;
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
    await updateNote(editingId, user.user_id, { title, content, category, mood: selectedMood });
    closeModal(); 
    loadNotes();
    showAlert({ icon: '✅', title: 'Updated', message: 'Note updated successfully!' });
  } catch (err) {
    showAlert({ icon: '❌', title: 'Failed to save', message: err.message });
  }
});

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    renderNotes(allNotes.filter(n => n.title.toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q)));
  });
}
document.addEventListener('click', () =>
  document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.add('hidden'))
);
function showLoading(show) { document.getElementById('loadingState').classList.toggle('hidden', !show); }
function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
loadNotes();