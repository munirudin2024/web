-- Data awal
INSERT INTO departments (name, description) VALUES
('Milling', 'Proses penggilingan'),
('Mixing', 'Proses pencampuran'),
('Packing', 'Proses pengemasan');

INSERT INTO users (username, password, role, department_id) VALUES
('super', crypt('123456', gen_salt('bf')), 'admin', 1),
('milling_user', crypt('123456', gen_salt('bf')), 'user', 1),
('packing_user', crypt('123456', gen_salt('bf')), 'user', 3);

INSERT INTO warehouses (name, address, department_id) VALUES
('Gudang Utama', 'Jl. Industri No.1', 1);

INSERT INTO racks (code, warehouse_id, max_pallets) VALUES
('RACK-A1', 1, 10);

INSERT INTO pallets (code, rack_id, max_boxes) VALUES
('PAL-001', 1, 50);

INSERT INTO boxes (code, pallet_id, sku, quantity, expiry_date) VALUES
('BOX-001', 1, 'SPA00023', 100, '2025-12-31'),
('BOX-002', 1, 'BAG00044', 200, '2025-11-30');

INSERT INTO purchase_orders (po_number, department_id, requested_by) VALUES
('PO-20240903', 1, 1);