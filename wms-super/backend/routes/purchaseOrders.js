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

// GET all POs
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT po.*, d.name AS department_name, u.username AS requested_by_username
    FROM purchase_orders po
    LEFT JOIN departments d ON po.department_id = d.id
    LEFT JOIN users u ON po.requested_by = u.id
    ORDER BY po.id DESC
  `);
  res.json(rows);
});

// POST new PO
router.post('/', auth, async (req, res) => {
  const { po_number, department_id } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO purchase_orders(po_number, department_id, requested_by) VALUES($1,$2,$3) RETURNING *',
    [po_number, department_id, req.user.id]
  );
  res.status(201).json(rows[0]);
});

module.exports = router;