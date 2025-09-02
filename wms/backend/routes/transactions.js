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

// Get transaction history
router.get('/', auth, async (req, res) => {
    const { product_id, start_date, end_date, type } = req.query;
    
    let query = `
        SELECT t.*, p.name as product_name, p.sku, u.username
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        JOIN users u ON t.user_id = u.id
        WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (product_id) {
        paramCount++;
        query += ` AND t.product_id = $${paramCount}`;
        params.push(product_id);
    }
    
    if (start_date) {
        paramCount++;
        query += ` AND t.created_at >= $${paramCount}`;
        params.push(start_date);
    }
    
    if (end_date) {
        paramCount++;
        query += ` AND t.created_at <= $${paramCount}`;
        params.push(end_date);
    }
    
    if (type) {
        paramCount++;
        query += ` AND t.type = $${paramCount}`;
        params.push(type);
    }
    
    query += ` ORDER BY t.created_at DESC`;
    
    try {
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil data transaksi' });
    }
});

// Get transaction summary
router.get('/summary', auth, async (req, res) => {
    const { period = 'today' } = req.query;
    
    let dateFilter = '';
    switch (period) {
        case 'today':
            dateFilter = "DATE(created_at) = CURRENT_DATE";
            break;
        case 'week':
            dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
            break;
        case 'month':
            dateFilter = "EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)";
            break;
    }
    
    try {
        const { rows } = await pool.query(`
            SELECT 
                SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) as total_in,
                SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) as total_out,
                COUNT(*) as total_transactions
            FROM transactions
            WHERE ${dateFilter}
        `);
        
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil summary' });
    }
});

module.exports = router;