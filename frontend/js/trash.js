import { requireLogin } from './auth.js';
import { renderSidebar, renderTopbar, getCategoryColor, showConfirm, showAlert } from './component.js';
import { getNotes, restoreNote, deleteNote } from './api.js';

const user = requireLogin();
renderSidebar('trash');
const searchInput = renderTopbar('Trash');

let allNotes = [];

async function loadNotes() {
  showLoading(true);
  try {
    const data = await getNotes(user.user_id);
    allNotes = data.filter(n => n.is_delete);
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
  const card = document.createElement('div');
  card.className = 'rounded-[1.2rem] p-4 flex flex-col gap-1 shadow-sm bg-gray-300 border border-gray-100 opacity-100 hover:opacity-100 transition cursor-pointer relative';

  const dateStr = new Date(note.created_at).toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  const moodHtml = note.mood ? `<span class="text-lg leading-none grayscale">${note.mood}</span>` : '';

  card.innerHTML = `
    <div class="flex items-center justify-between px-2">
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-bold uppercase tracking-widest text-gray-500">${note.category || 'Others'}</span>
        <span class="text-[9px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold">TRASH</span>
      </div>
      <div class="relative">
        <button class="btn-menu p-1 rounded-lg hover:bg-black/10 transition">
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </button>
        <div class="dropdown-menu hidden absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-10 w-44 py-1 text-sm">
          <button class="btn-restore w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium">♻️ Restore</button>
          <button class="btn-delete w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500 font-medium">❌ Permanently Delete</button>
        </div>
      </div>
    </div>

    <div class="bg-white/100 rounded-[0.8rem] p-5 flex flex-col gap-3 flex-1">
      <div class="flex items-center gap-1.5 min-w-0 min-h-[24px]">
        ${moodHtml}
        <h3 class="font-bold text-gray-500 text-sm leading-snug truncate line-through">${escapeHtml(note.title)}</h3>
      </div>
      <p class="text-[10px] text-gray-400 flex items-center gap-1 border-b border-gray-80 pb-2">
        <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        ${dateStr}
      </p>
      <p class="text-sm text-gray-400 line-clamp-3 leading-relaxed italic">${escapeHtml(note.content || '')}</p>
    </div>

  `;  card.querySelector('.btn-menu').addEventListener('click', e => {
    e.stopPropagation();
    const dd = card.querySelector('.dropdown-menu');
    document.querySelectorAll('.dropdown-menu').forEach(d => { if (d !== dd) d.classList.add('hidden'); });
    dd.classList.toggle('hidden');
  });

  card.querySelector('.btn-restore').addEventListener('click', e => {
    e.stopPropagation();
    showConfirm({ icon: '♻️', title: 'Restore note?', message: `"${note.title}" will be moved back to All Notes.`,
      confirmText: 'Restore', confirmClass: 'bg-[#9277C0] hover:bg-[#8165AE]',
      onConfirm: async () => { await restoreNote(note.note_id, user.user_id); loadNotes(); }
    });
  });

  card.querySelector('.btn-delete').addEventListener('click', e => {
    e.stopPropagation();
    showConfirm({ icon: '💀', title: 'Permanently delete?', message: `"${note.title}" will be permanently deleted and cannot be recovered.`,
      confirmText: 'Delete', confirmClass: 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        try {
          await deleteNote(note.note_id, user.user_id);
          loadNotes();
        } catch(err) {
          showAlert({ icon: '❌', title: 'Failed to delete', message: err.message });
        }
      }
    });
  });

  return card;
}

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