const express = require('express');
const { db } = require('../db/init');

const router = express.Router();

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.session.vendorId) {
        next();
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};

// Get all orders for vendor
router.get('/', isAuthenticated, (req, res) => {
    db.all(`SELECT * FROM orders WHERE vendor_id = ? ORDER BY created_at DESC`, [req.session.vendorId], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(orders);
    });
});

// Get single order with items
router.get('/:id', isAuthenticated, (req, res) => {
    db.get('SELECT * FROM orders WHERE id = ? AND vendor_id = ?', [req.params.id, req.session.vendorId], (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        db.all('SELECT * FROM order_items WHERE order_id = ?', [req.params.id], (err, items) => {
            if (err) {
                return res.status(500).json({ error: 'Server error' });
            }
            res.json({ ...order, items });
        });
    });
});

// Create new order (public)
router.post('/', (req, res) => {
    const { vendor_id, buyer_name, buyer_email, buyer_phone, items, delivery_address } = req.body;

    if (!vendor_id || !buyer_name || !buyer_email || !buyer_phone || !items || !delivery_address) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    let total_amount = 0;
    let total_quantity = 0;

    // Calculate totals from products
    db.serialize(() => {
        const placeholders = items.map(() => '?').join(',');
        const itemIds = items.map(item => item.product_id);

        db.all(`SELECT id, price FROM products WHERE id IN (${placeholders})`, itemIds, (err, products) => {
            if (err) {
                return res.status(500).json({ error: 'Server error' });
            }

            items.forEach(item => {
                const product = products.find(p => p.id === item.product_id);
                if (product) {
                    total_amount += product.price * item.quantity;
                    total_quantity += item.quantity;
                }
            });

            db.run(
                `INSERT INTO orders (vendor_id, buyer_name, buyer_email, buyer_phone, total_amount, quantity, delivery_address) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [vendor_id, buyer_name, buyer_email, buyer_phone, total_amount, total_quantity, delivery_address],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create order' });
                    }

                    const orderId = this.lastID;
                    let itemsInserted = 0;

                    items.forEach(item => {
                        const product = products.find(p => p.id === item.product_id);
                        db.run(
                            `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
                            [orderId, item.product_id, item.quantity, product?.price || 0],
                            (err) => {
                                if (!err) itemsInserted++;
                                if (itemsInserted === items.length) {
                                    res.status(201).json({ success: true, message: 'Order created', orderId });
                                }
                            }
                        );
                    });
                }
            );
        });
    });
});

// Update order status
router.put('/:id/status', isAuthenticated, (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status required' });
    }

    db.run('UPDATE orders SET status = ? WHERE id = ? AND vendor_id = ?', [status, req.params.id, req.session.vendorId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update order' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Order not found or unauthorized' });
        }
        res.json({ success: true, message: 'Order status updated' });
    });
});

module.exports = router;
