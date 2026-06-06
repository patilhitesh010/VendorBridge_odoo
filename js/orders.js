document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

function loadOrders() {
    const search = document.getElementById('order-search').value;
    const status = document.getElementById('status-filter').value;
    
    let url = `/orders/list?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`;
    
    fetch(url)
        .then(res => res.json())
        .then(orders => {
            const list = document.getElementById('order-list');
            list.innerHTML = '';
            orders.forEach(o => {
                const row = `
                    <tr>
                        <td>#${o.id}</td>
                        <td>${o.customer_name}<br><small>${o.customer_email}</small></td>
                        <td>$${o.total_amount.toFixed(2)}</td>
                        <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                        <td>${o.tracking_number || '---'}</td>
                        <td>
                            <button class="btn-sm btn-edit" onclick='showOrderModal(${JSON.stringify(o)})'>Update</button>
                        </td>
                    </tr>
                `;
                list.innerHTML += row;
            });
        });
}

function showOrderModal(order) {
    const modal = document.getElementById('order-modal');
    const form = document.getElementById('order-form');
    document.getElementById('modal-order-id').textContent = order.id;
    form.action = `/orders/update/${order.id}`;
    
    document.getElementById('status').value = order.status;
    document.getElementById('tracking_number').value = order.tracking_number || '';
    
    modal.classList.remove('hidden');
}

function hideModal() {
    document.getElementById('order-modal').classList.add('hidden');
}