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

// GET all pallets
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT p.*, r.code AS rack_code
    FROM pallets p
    LEFT JOIN racks r ON p.rack_id = r.id
    ORDER BY p.id DESC
  `);
  res.json(rows);
});

// POST new pallet
router.post('/', auth, async (req, res) => {
  const { code, rack_id, max_boxes } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO pallets(code, rack_id, max_boxes) VALUES($1,$2,$3) RETURNING *',
    [code, rack_id, max_boxes]
  );
  res.status(201).json(rows[0]);
});

module.exports = router;