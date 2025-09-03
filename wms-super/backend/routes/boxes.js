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

// GET all boxes
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT b.*, p.code AS pallet_code, r.code AS rack_code
    FROM boxes b
    LEFT JOIN pallets p ON b.pallet_id = p.id
    LEFT JOIN racks r ON p.rack_id = r.id
    ORDER BY b.expiry_date ASC -- FIFO
  `);
  res.json(rows);
});

// POST new box
router.post('/', auth, async (req, res) => {
  const { code, pallet_id, sku, quantity, expiry_date } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO boxes(code, pallet_id, sku, quantity, expiry_date) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [code, pallet_id, sku, quantity, expiry_date]
  );
  res.status(201).json(rows[0]);
});

module.exports = router;