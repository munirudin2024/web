// === CONFIG ===
const API_URL = 'https://orange-memory-x544xp454ww63p9qr-3000.app.github.dev/api';

// === UTILS ===
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// === DASHBOARD ===
async function loadSummary() {
  const [wh, rack, pallet, box] = await Promise.all([
    fetch(`${API_URL}/warehouses`).then(r => r.json()),
    fetch(`${API_URL}/racks`).then(r => r.json()),
    fetch(`${API_URL}/pallets`).then(r => r.json()),
    fetch(`${API_URL}/boxes`).then(r => r.json())
  ]);
  document.getElementById('totalWh').textContent = wh.length;
  document.getElementById('totalRack').textContent = rack.length;
  document.getElementById('totalPallet').textContent = pallet.length;
  document.getElementById('totalBox').textContent = box.length;
  drawChart(box);
}

// === SCAN IN/OUT ===
async function scanAction() {
  const sku = document.getElementById('scanSku').value.trim().toUpperCase();
  const qty = parseInt(document.getElementById('scanQty').value);
  const type = document.getElementById('scanType').value;
  if (!sku || !qty) return alert('Isi SKU & Qty');
  const token = localStorage.getItem('token');
  if (!token) return alert('Login ulang');

  try {
    // Ambil FIFO untuk OUT
    const res = type === 'OUT'
      ? await fetch(`${API_URL}/transactions/fifo/${sku}`)
      : await fetch(`${API_URL}/boxes?sku=${sku}`);
    const box = await res.json();
    const boxId = type === 'OUT' ? box.id : box[0]?.id;
    if (!boxId) return alert('Box tidak ditemukan');

    await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ box_id: boxId, type, quantity: qty, notes: 'Scan action' })
    });
    alert('Permintaan terkirim, tunggu approval');
    loadAll();
  } catch (e) {
    alert(e.message);
  }
}

// === APPROVAL INLINE ===
async function loadApproval() {
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
        <button onclick="approve(${t.id}, 'approved')">✅</button>
        <button onclick="approve(${t.id}, 'rejected')">❌</button>
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
  loadAll();
}

// === CHART ===
function drawChart(boxes) {
  const labels = boxes.map(b => b.sku);
  const data = boxes.map(b => b.quantity);
  new Chart(document.getElementById('stockChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Stok', data, backgroundColor: '#007bff' }]
    }
  });
}

// === LOG ===
async function loadLog() {
  const res = await fetch(`${API_URL}/transactions`);
  const data = await res.json();
  const ul = document.getElementById('logList');
  ul.innerHTML = data.slice(0, 10).map(t => `
    <li>${t.type} ${t.quantity} ${t.sku} oleh ${t.username} (${t.created_at})</li>
  `).join('');
}

// === AUTO REFRESH ===
function loadAll() {
  loadSummary();
  loadApproval();
  loadLog();
}
setInterval(loadAll, 10000); // refresh setiap 10 detik
loadAll();