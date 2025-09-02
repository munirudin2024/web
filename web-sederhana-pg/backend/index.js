require('dotenv').config();            // baca .env
const express = require('express');
const cors  = require('cors');
const { Pool } = require('pg');

const app  = express();
const port = process.env.PORT || 3000;

// Konfigurasi koneksi DB
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), // dipaksa string
  database: process.env.DB_DATABASE,
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// GET /api/items  -> ambil semua data
app.get('/api/items', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ error: 'Gagal ambil data' });
  }
});

// POST /api/items -> tambah data baru
app.post('/api/items', async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Nama harus diisi' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO items (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: 'Gagal simpan data' });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan ${port}`);
});