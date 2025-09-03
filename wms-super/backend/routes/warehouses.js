const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_DATABASE,
});

router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT w.*, d.name AS department_name
    FROM warehouses w
    LEFT JOIN departments d ON w.department_id = d.id
    ORDER BY w.id DESC
  `);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, address, department_id } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO warehouses(name, address, department_id) VALUES($1,$2,$3) RETURNING *',
    [name, address, department_id]
  );
  res.status(201).json(rows[0]);
});

module.exports = router;
