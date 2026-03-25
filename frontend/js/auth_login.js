import { login } from './api.js';
import { saveUser, getUser } from './auth.js';

if (getUser()) {
  window.location.href = 'all_notes.html';
}

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // Reset error
  document.getElementById('usernameError')?.classList.add('hidden');
  document.getElementById('passwordError')?.classList.add('hidden');

  if (!username) {
    document.getElementById('usernameError')?.classList.remove('hidden');
    return;
  }
  if (!password) {
    document.getElementById('passwordError')?.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Signing in...';
  btn.disabled = true;

  try {
    const data = await login(username, password);

    // Simpan user ke localStorage
    const userData = data.user || data;
    saveUser({
      user_id:  userData.user_id,
      username: userData.username,
      email:    userData.email,
    });

    // Redirect ke halaman utama
    window.location.href = '../pages/all_notes.html';

  } catch (err) {
    btn.textContent = 'Login';
    btn.disabled = false;

    // Tampilkan pesan error dari backend
    const errEl = document.getElementById('loginError');
    if (errEl) {
      errEl.textContent = err.message || 'Username or password incorrect.';
      errEl.classList.remove('hidden');
    } else {
      alert(err.message || 'Failed to login. Check your password or username');
    }
  }
});