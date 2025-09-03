# WMS Super Advance

Warehouse Management System dengan FIFO, multi-departemen, approval workflow, dan PO system.

## Teknologi
- PostgreSQL
- Node.js + Express
- Vanilla HTML/CSS/JS

## Jalankan di GitHub Codespaces
```bash
# 1. Setup database
sudo service postgresql start
sudo -u postgres psql -f database/schema.sql
sudo -u postgres psql -d wms_super -f database/seed.sql

# 2. Backend
cd backend
npm install
npm run dev

# 3. Frontend
cd frontend
npx live-server --port=5500

--------------------------------------
Login Demo
Username: super
Password: 123456
----------------

### ✅ Cara pakai:
```bash
# Setup semua
sudo -u postgres psql -f database/schema.sql
sudo -u postgres psql -d wms_super -f database/seed.sql

