# web-------------------------------------------------
1. Update repository dan add PostgreSQL official repo:
# Update package list
sudo apt update

# Install prerequisites
sudo apt install -y wget ca-certificates

# Add PostgreSQL official APT repository
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

# Update package list again
sudo apt update

2. Install PostgreSQL:
# Install PostgreSQL (latest version)
sudo apt install -y postgresql postgresql-contrib

# Install PostgreSQL client tools
sudo apt install -y postgresql-client

---------------------------------------------------------
✅ Verification - Cek Instalasi

1. Cek service PostgreSQL:
# Cek semua services
service --status-all

# Start PostgreSQL service
sudo service postgresql start

# Cek status PostgreSQL
sudo service postgresql status

2. Cek versi dan test connection:
# Cek versi PostgreSQL
psql --version

# Cek .NET version
dotnet --version

# Test PostgreSQL berjalan
sudo -u postgres psql -c "SELECT version();"

------------------------------------------------------------
Alternative: Manual Start PostgreSQL
Kalau service command tidak work, coba manual:
# Start PostgreSQL cluster
sudo pg_ctlcluster 17 main start

# Cek cluster status
pg_lsclusters

# Test connection
sudo -u postgres psql

------------------------------------------------------------
🚀 Quick Setup Database
Setelah PostgreSQL running:

# 1. Set password postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password123';"

# 2. Create database untuk portfolio
sudo -u postgres createdb portfolio_db

# 3. Test connection
sudo -u postgres psql -l

------------------------------------------------------------
💡 Alternative: Pakai SQLite untuk Development
Kalau PostgreSQL ribet di Codespace, bisa pakai SQLite dulu:
# SQLite sudah built-in, tidak perlu install
sqlite3 --version

# Buat database SQLite
sqlite3 portfolio.db

------------------------------------------------------------
Connection string SQLite untuk ASP.NET:

{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=portfolio.db"
  }
}

------------------------------------------------------------
🎯 Coba Commands Ini:
# 1. Check services
service --status-all

# 2. Start PostgreSQL
sudo service postgresql start

# 3. Check versions
psql --version && echo "---" && dotnet --version

# 4. Test PostgreSQL
sudo -u postgres psql -c "SELECT version();"