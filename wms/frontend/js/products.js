const API_URL = 'https://orange-memory-x544xp454ww63p9qr-3000.app.github.dev/api';
let token = localStorage.getItem('token');
let products = [];

// Cek login
if (!token) {
    window.location.href = 'login.html';
}

// Load data saat halaman dibuka
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCategories();
});

async function loadProducts() {
    try {
        const params = new URLSearchParams();
        if (document.getElementById('searchInput').value) {
            params.append('search', document.getElementById('searchInput').value);
        }
        if (document.getElementById('categoryFilter').value) {
            params.append('category', document.getElementById('categoryFilter').value);
        }
        if (document.getElementById('lowStockFilter').checked) {
            params.append('low_stock', 'true');
        }

        const res = await fetch(`${API_URL}/products?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        products = await res.json();
        displayProducts(products);
    } catch (err) {
        console.error('Error loading products:', err);
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('productsBody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const tr = document.createElement('tr');
        if (product.quantity <= product.min_stock) {
            tr.classList.add('low-stock');
        }
        
        tr.innerHTML = `
            <td>${product.sku}</td>
            <td>${product.name}</td>
            <td>${product.category_name}</td>
            <td>${product.quantity}</td>
            <td>Rp ${product.price.toLocaleString('id-ID')}</td>
            <td>${product.min_stock}</td>
            <td>
                <button onclick="openStockModal(${product.id})">Update Stok</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const categories = await res.json();
        
        const categorySelects = ['category', 'categoryFilter'];
        categorySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = selectId === 'categoryFilter' ? '<option value="">Semua Kategori</option>' : '<option value="">Pilih Kategori</option>';
            
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        });
    } catch (err) {
        console.error('Error loading categories:', err);
    }
}

// Event listeners
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productData = {
        sku: document.getElementById('sku').value,
        name: document.getElementById('name').value,
        category_id: document.getElementById('category').value,
        quantity: parseInt(document.getElementById('quantity').value),
        price: parseFloat(document.getElementById('price').value),
        min_stock: parseInt(document.getElementById('minStock').value)
    };
    
    try {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        if (res.ok) {
            loadProducts();
            e.target.reset();
            alert('Produk berhasil ditambahkan');
        }
    } catch (err) {
        console.error('Error adding product:', err);
    }
});

// Stock modal
function openStockModal(productId) {
    document.getElementById('productId').value = productId;
    document.getElementById('stockModal').style.display = 'block';
}

document.querySelector('.close').onclick = () => {
    document.getElementById('stockModal').style.display = 'none';
};

document.getElementById('stockForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const stockData = {
        quantity: parseInt(document.getElementById('stockQuantity').value),
        type: document.getElementById('stockType').value,
        notes: document.getElementById('stockNotes').value
    };
    
    const productId = document.getElementById('productId').value;
    
    try {
        const res = await fetch(`${API_URL}/products/${productId}/stock`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(stockData)
        });
        
        if (res.ok) {
            loadProducts();
            document.getElementById('stockModal').style.display = 'none';
            document.getElementById('stockForm').reset();
            alert('Stok berhasil diperbarui');
        }
    } catch (err) {
        console.error('Error updating stock:', err);
    }
});

// Export CSV
function exportCSV() {
    const headers = ['SKU', 'Nama', 'Kategori', 'Stok', 'Harga', 'Stok Minimum'];
    const rows = products.map(p => [
        p.sku,
        p.name,
        p.category_name,
        p.quantity,
        p.price,
        p.min_stock
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products.csv';
    link.click();
}

// Search & filter
document.getElementById('searchInput').addEventListener('input', loadProducts);
document.getElementById('categoryFilter').addEventListener('change', loadProducts);
document.getElementById('lowStockFilter').addEventListener('change', loadProducts);