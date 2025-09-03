const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const router = express.Router();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_DATABASE,
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE username=$1 AND password=crypt($2, password)',
    [username, password]
  );
  if (rows.length === 0) return res.status(400).json({ error: 'Salah username atau password' });

  const token = jwt.sign({ id: rows[0].id, username: rows[0].username }, process.env.JWT_SECRET);
  res.json({ token, user: rows[0] });
});

module.exports = router;
