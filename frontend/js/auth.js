export const saveUser = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export function requireLogin() {
  const data = localStorage.getItem('user');
  
  if (!data) {
      window.location.href = 'login.html';
      return null;
  }
  
  return JSON.parse(data);
}

export const logout = () => {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
};