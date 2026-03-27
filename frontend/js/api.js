// const BASE_URL = 'http://localhost:3000/api';

const BASE_URL = 'http://136.116.109.103:3000/api';

// Helper
function getHeaders() {
  return { 'Content-Type': 'application/json' };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

// Auth
export async function register(username, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

// Notes
export async function getNotes(userId) {
  const res = await fetch(`${BASE_URL}/notes/user/${userId}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function createNote(noteData) {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(noteData),
  });
  return handleResponse(res);
}

export async function updateNote(noteId, userId, fields) {
  const res = await fetch(`${BASE_URL}/notes/${noteId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ user_id: userId, ...fields }),
  });
  return handleResponse(res);
}

export async function deleteNote(noteId, userId) {
  const res = await fetch(`${BASE_URL}/notes/${noteId}`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ user_id: userId }),
  });
  return handleResponse(res);
}

export async function toggleFavorite(noteId, userId, value) {
  return updateNote(noteId, userId, { is_favorite: value });
}

export async function trashNote(noteId, userId) {
  return updateNote(noteId, userId, { is_delete: 1 });
}

export async function archiveNote(noteId, userId) {
  return updateNote(noteId, userId, { is_archive: 1 });
}

export async function restoreNote(noteId, userId) {
  return updateNote(noteId, userId, { is_delete: 0, is_archive: 0 });
}