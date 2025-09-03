//const API_URL = 'https://' + window.location.hostname.replace('5500', '3000') + '/api';
const API_URL = 'https://orange-memory-x544xp454ww63p9qr-3000.app.github.dev/api';

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

async function loadDepartments() {
  const res = await fetch(`${API_URL}/departments`);
  const data = await res.json();
  const sel = document.getElementById('department_id');
  sel.innerHTML = data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

async function loadPOs() {
  const res = await fetch(`${API_URL}/purchase-orders`);
  const data = await res.json();
  const ul = document.getElementById('poList');
  ul.innerHTML = data.map(po => `<li>${po.po_number} - ${po.department_name} (${po.status})</li>`).join('');
}

document.getElementById('poForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const po_number = document.getElementById('po_number').value;
  const department_id = document.getElementById('department_id').value;
  const token = localStorage.getItem('token');

  await fetch(`${API_URL}/purchase-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ po_number, department_id })
  });
  loadPOs();
});

loadDepartments();
loadPOs();