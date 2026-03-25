import { register } from './api.js';
import { getUser }  from './auth.js';

if (getUser()) {
  window.location.href = '../pages/all_notes.html';
}

document.getElementById('signupForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Reset errors
  ['usernameError', 'emailError', 'passwordError'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });

  let valid = true;
  if (!username) { document.getElementById('usernameError')?.classList.remove('hidden'); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('emailError')?.classList.remove('hidden'); valid = false; }
  if (password.length < 8) { document.getElementById('passwordError')?.classList.remove('hidden'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Signing up...';
  btn.disabled = true;

  try {
    await register(username, email, password);
    
    const overlay = document.getElementById('successOverlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      setTimeout(() => document.getElementById('progressBar').style.width = '100%', 50);
      setTimeout(() => window.location.href = 'login.html', 2700);
    } else {
      alert('Registration successful! Please log in.');
      window.location.href = 'login.html';
    }

  } catch (err) {
    btn.textContent = 'Sign Up';
    btn.disabled = false;
    alert(err.message || 'Registration failed. Please try again.');
  }
});