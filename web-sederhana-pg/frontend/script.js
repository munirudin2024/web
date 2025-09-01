// --- URL backend (ganti dengan punyamu) ---
const API_URL = 'https://orange-memory-x544xp454ww63p9qr-3000.app.github.dev/api/items';

// --- Cek apakah JS ter-load ---
console.log('Frontend JS loaded');

// --- Ambil elemen ---
const form  = document.getElementById('itemForm');
const input = document.getElementById('itemNameInput');
const list  = document.getElementById('itemList');

// --- Event listener ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return alert('Nama tidak boleh kosong');
  console.log('Menambahkan:', name);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Gagal simpan');
    await res.json();          // kita tidak pakai hasilnya
    input.value = '';          // kosongkan input
    fetchItems();              // reload list
  } catch (err) {
    console.error(err);
    alert('Gagal menambahkan item');
  }
});

// --- Ambil semua item ---
async function fetchItems() {
  try {
    const res  = await fetch(API_URL);
    const data = await res.json();
    console.log('Data diterima:', data);
    list.innerHTML = '';
    if (!data.length) list.innerHTML = '<li>Data masih kosong</li>';
    data.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.name;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = '<li>Gagal memuat data</li>';
  }
}

// --- Jalankan saat halaman dibuka ---
fetchItems();