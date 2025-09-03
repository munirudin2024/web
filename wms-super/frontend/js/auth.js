//const API_URL = 'https://' + window.location.hostname.replace('5500', '3000') + '/api';
const API_URL = 'https://orange-memory-x544xp454ww63p9qr-3000.app.github.dev/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) return alert('Isi username & password');
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = 'dashboard.html';
    } else {
      alert(data.error || 'Login gagal');
    }
  } catch {
    alert('Terjadi kesalahan saat login.');
  }
});