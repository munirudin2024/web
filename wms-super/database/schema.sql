-- EXTENSION
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- DEPARTMENTS
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    department_id INTEGER REFERENCES departments(id)
);

-- WAREHOUSES
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    department_id INTEGER REFERENCES departments(id)
);

-- RACKS
CREATE TABLE racks (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id),
    max_pallets INTEGER DEFAULT 10
);

-- PALLETS
CREATE TABLE pallets (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    rack_id INTEGER REFERENCES racks(id),
    max_boxes INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT NOW()
);

-- BOXES (FIFO ready)
CREATE TABLE boxes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    pallet_id INTEGER REFERENCES pallets(id),
    sku VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PURCHASE ORDERS
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    status VARCHAR(20) DEFAULT 'pending',
    requested_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- APPROVALS
CREATE TABLE approvals (
    id SERIAL PRIMARY KEY,
    request_type VARCHAR(20), -- IN / OUT / PO
    request_id INTEGER,
    requested_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TRANSACTIONS
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    box_id INTEGER REFERENCES boxes(id),
    type VARCHAR(10) CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL,
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);