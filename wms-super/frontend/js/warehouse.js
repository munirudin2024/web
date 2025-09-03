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

async function loadWarehouses() {
  const res = await fetch(`${API_URL}/warehouses`);
  const data = await res.json();
  const ul = document.getElementById('warehouseList');
  ul.innerHTML = data.map(w => `<li>${w.name} - ${w.department_name}</li>`).join('');
}

document.getElementById('warehouseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;
  const department_id = document.getElementById('department_id').value;
  const token = localStorage.getItem('token');

  await fetch(`${API_URL}/warehouses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ name, address, department_id })
  });
  loadWarehouses();
});

loadDepartments();
loadWarehouses();