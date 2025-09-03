const express = require('express');
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_DATABASE,
});

// GET all transactions (stock in/out)
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT t.*, b.sku, u.username
    FROM transactions t
    LEFT JOIN boxes b ON t.box_id = b.id
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `);
  res.json(rows);
});

// POST new transaction (IN/OUT)
router.post('/', auth, async (req, res) => {
  const { box_id, type, quantity, notes } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM boxes WHERE id=$1', [box_id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Box tidak ditemukan' });

    let newQty = rows[0].quantity + (type === 'IN' ? quantity : -quantity);
    if (newQty < 0) return res.status(400).json({ error: 'Stok tidak cukup' });

    await client.query('UPDATE boxes SET quantity=$1 WHERE id=$2', [newQty, box_id]);
    await client.query(
      'INSERT INTO transactions(box_id, type, quantity, notes, user_id) VALUES($1,$2,$3,$4,$5)',
      [box_id, type, quantity, notes, req.user.id]
    );
    await client.query('COMMIT');
    res.json({ message: 'Transaksi berhasil' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET pending approvals
router.get('/pending', auth, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT t.*, b.code AS box_code, b.sku, u.username AS requester
    FROM transactions t
    JOIN boxes b ON t.box_id = b.id
    JOIN users u ON t.user_id = u.id
    WHERE t.status = 'pending'
    ORDER BY t.created_at ASC
  `);
  res.json(rows);
});

// PATCH approve/reject
router.patch('/:id/approve', auth, async (req, res) => {
  const { status, notes } = req.body;
  const id = req.params.id;
  await pool.query(
    'UPDATE transactions SET status=$1, approved_by=$2, notes=$3 WHERE id=$4',
    [status, req.user.id, notes, id]
  );
  res.json({ message: 'Transaksi ' + status });
});

// GET FIFO box by SKU
router.get('/fifo/:sku', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT * FROM boxes
    WHERE sku = $1 AND quantity > 0
    ORDER BY expiry_date ASC
    LIMIT 1
  `, [req.params.sku]);
  res.json(rows[0] || null);
});

module.exports = router;