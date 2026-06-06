const express = require('express');
const { db } = require('../db/init');

const router = express.Router();

// Get order status by order ID and email (public)
router.get('/order-status/:orderId', (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    db.get('SELECT * FROM orders WHERE id = ? AND buyer_email = ?', [req.params.orderId, email], (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        db.all('SELECT oi.*, p.name, p.price FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [req.params.orderId], (err, items) => {
            if (err) {
                return res.status(500).json({ error: 'Server error' });
            }

            db.get('SELECT name, email, phone, company_name FROM vendors WHERE id = ?', [order.vendor_id], (err, vendor) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }

                res.json({
                    order: {
                        id: order.id,
                        buyer_name: order.buyer_name,
                        buyer_email: order.buyer_email,
                        buyer_phone: order.buyer_phone,
                        delivery_address: order.delivery_address,
                        total_amount: order.total_amount,
                        status: order.status,
                        created_at: order.created_at
                    },
                    vendor: vendor,
                    items: items
                });
            });
        });
    });
});

// Get invoice data
router.get('/invoice/:orderId', (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    db.get('SELECT * FROM orders WHERE id = ? AND buyer_email = ?', [req.params.orderId, email], (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        db.all('SELECT oi.*, p.name, p.price, p.category FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [req.params.orderId], (err, items) => {
            if (err) {
                return res.status(500).json({ error: 'Server error' });
            }

            db.get('SELECT name, email, phone, company_name, address, city, state FROM vendors WHERE id = ?', [order.vendor_id], (err, vendor) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }

                res.json({
                    orderNumber: `#${order.id}`,
                    orderDate: new Date(order.created_at).toLocaleDateString('en-IN'),
                    vendor: vendor,
                    buyer: {
                        name: order.buyer_name,
                        email: order.buyer_email,
                        phone: order.buyer_phone,
                        address: order.delivery_address
                    },
                    items: items,
                    subtotal: order.total_amount,
                    tax: 0,
                    total: order.total_amount,
                    status: order.status
                });
            });
        });
    });
});

module.exports = router;
