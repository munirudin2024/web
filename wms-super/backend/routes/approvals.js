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

// GET all approvals
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT a.*, u1.username AS requested_by_username, u2.username AS approved_by_username
    FROM approvals a
    LEFT JOIN users u1 ON a.requested_by = u1.id
    LEFT JOIN users u2 ON a.approved_by = u2.id
    ORDER BY a.id DESC
  `);
  res.json(rows);
});

// POST new approval
router.post('/', auth, async (req, res) => {
  const { request_type, request_id, notes } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO approvals(request_type, request_id, requested_by, notes) VALUES($1,$2,$3,$4) RETURNING *',
    [request_type, request_id, req.user.id, notes]
  );
  res.status(201).json(rows[0]);
});

module.exports = router;