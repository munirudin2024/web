const express = require('express');
const { Pool } = require('pg');
const auth = require('../middleware/auth');
const router = express.Router();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Get all products dengan filter
router.get('/', async (req, res) => {
  const { search, category, low_stock } = req.query;
  
  let query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];
  
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
  }
  
  if (category) {
    params.push(category);
    query += ` AND p.category_id = $${params.length}`;
  }
  
  if (low_stock === 'true') {
    query += ` AND p.quantity <= p.min_stock`;
  }
  
  query += ` ORDER BY p.created_at DESC`;
  
  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
});

// Add product
router.post('/', auth, async (req, res) => {
  const { sku, name, category_id, quantity, price, min_stock } = req.body;
  
  try {
    const { rows } = await pool.query(
      'INSERT INTO products (sku, name, category_id, quantity, price, min_stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [sku, name, category_id, quantity, price, min_stock]
    );
    
    // Record transaction
    await pool.query(
      'INSERT INTO transactions (product_id, type, quantity, notes, user_id) VALUES ($1, $2, $3, $4, $5)',
      [rows[0].id, 'IN', quantity, 'Stok awal', req.user.id]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambahkan produk' });
  }
});

// Update stock
router.put('/:id/stock', auth, async (req, res) => {
  const { quantity, type, notes } = req.body;
  const productId = req.params.id;
  
  try {
    await pool.query('BEGIN');
    
    const { rows: productRows } = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    
    const product = productRows[0];
    let newQuantity = product.quantity;
    
    if (type === 'IN') {
      newQuantity += quantity;
    } else if (type === 'OUT') {
      if (product.quantity < quantity) {
        return res.status(400).json({ error: 'Stok tidak cukup' });
      }
      newQuantity -= quantity;
    }
    
    await pool.query('UPDATE products SET quantity = $1 WHERE id = $2', [newQuantity, productId]);
    await pool.query(
      'INSERT INTO transactions (product_id, type, quantity, notes, user_id) VALUES ($1, $2, $3, $4, $5)',
      [productId, type, quantity, notes, req.user.id]
    );
    
    await pool.query('COMMIT');
    res.json({ message: 'Stok berhasil diperbarui' });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Gagal update stok' });
  }
});

module.exports = router;