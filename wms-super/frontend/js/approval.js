//const API_URL = 'https://' + window.location.hostname.replace('5500', '3000') + '/api';
const API_URL = 'https://orange-memory-x544xp454ww63p9qr-3000.app.github.dev/api';

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

async function loadPending() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/transactions/pending`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  const tbody = document.querySelector('#approvalTable tbody');
  tbody.innerHTML = data.map(t => `
    <tr>
      <td>${t.box_code}</td>
      <td>${t.sku}</td>
      <td>${t.quantity}</td>
      <td>${t.type}</td>
      <td>${t.requester}</td>
      <td>
        <button onclick="approve(${t.id}, 'approved')">✅ Approve</button>
        <button onclick="approve(${t.id}, 'rejected')">❌ Reject</button>
      </td>
    </tr>
  `).join('');
}

async function approve(id, status) {
  const token = localStorage.getItem('token');
  await fetch(`${API_URL}/transactions/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ status })
  });
  loadPending();
}

loadPending();