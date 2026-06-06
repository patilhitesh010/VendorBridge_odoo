document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

function loadProducts() {
    fetch('/products/list')
        .then(res => res.json())
        .then(products => {
            const list = document.getElementById('product-list');
            list.innerHTML = '';
            products.forEach(p => {
                const row = `
                    <tr>
                        <td>${p.sku}</td>
                        <td>${p.name}</td>
                        <td>$${p.price.toFixed(2)}</td>
                        <td>${p.stock}</td>
                        <td class="actions">
                            <button class="btn-sm btn-edit" onclick='showEditModal(${JSON.stringify(p)})'>Edit</button>
                            <form action="/products/delete/${p.id}" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure?')">
                                <button type="submit" class="btn-sm btn-delete">Delete</button>
                            </form>
                        </td>
                    </tr>
                `;
                list.innerHTML += row;
            });
        });
}

function showAddModal() {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    document.getElementById('modal-title').textContent = 'Add Product';
    form.action = '/products/add';
    form.reset();
    modal.classList.remove('hidden');
}

function showEditModal(product) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    document.getElementById('modal-title').textContent = 'Edit Product';
    form.action = `/products/edit/${product.id}`;
    
    document.getElementById('name').value = product.name;
    document.getElementById('sku').value = product.sku;
    document.getElementById('price').value = product.price;
    document.getElementById('stock').value = product.stock;
    document.getElementById('description').value = product.description;
    
    modal.classList.remove('hidden');
}

function hideModal() {
    document.getElementById('product-modal').classList.add('hidden');
}