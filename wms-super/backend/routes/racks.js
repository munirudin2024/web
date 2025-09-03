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

// GET all racks
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT r.*, w.name AS warehouse_name
    FROM racks r
    LEFT JOIN warehouses w ON r.warehouse_id = w.id
    ORDER BY r.id DESC
  `);
  res.json(rows);
});

// POST new rack
router.post('/', auth, async (req, res) => {
  const { code, warehouse_id, max_pallets } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO racks(code, warehouse_id, max_pallets) VALUES($1,$2,$3) RETURNING *',
    [code, warehouse_id, max_pallets]
  );
  res.status(201).json(rows[0]);
});

module.exports = router;