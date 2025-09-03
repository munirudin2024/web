require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_DATABASE,
});

app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/warehouses', require('./routes/warehouses'));
app.use('/api/racks', require('./routes/racks'));
app.use('/api/pallets', require('./routes/pallets'));
app.use('/api/boxes', require('./routes/boxes'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/transactions', require('./routes/transactions'));

app.get('/', (req, res) => {
  res.json({ message: 'WMS Super API Running' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server ready → http://localhost:${process.env.PORT}`);
});
