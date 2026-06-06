document.addEventListener('DOMContentLoaded', () => {
    fetch('/auth/status')
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                document.getElementById('welcome-msg').textContent = `Welcome, ${data.vendorName}`;
                document.getElementById('vendor-name-display').textContent = data.vendorName;
                loadStats();
            } else {
                window.location.href = '/login';
            }
        });

    function loadStats() {
        fetch('/dashboard/stats')
            .then(res => res.json())
            .then(stats => {
                document.getElementById('stat-products').textContent = stats.totalProducts;
                document.getElementById('stat-orders').textContent = stats.totalOrders;
                document.getElementById('stat-pending').textContent = stats.pendingOrders;
                document.getElementById('stat-shipped').textContent = stats.shippedOrders;

                const list = document.getElementById('recent-orders-list');
                list.innerHTML = '';
                stats.recentOrders.forEach(order => {
                    const row = `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.customer_name}</td>
                            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                            <td>$${order.total_amount.toFixed(2)}</td>
                            <td>${new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                    `;
                    list.innerHTML += row;
                });
            });
    }
});