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

// Get vendor profile
router.get('/', isAuthenticated, (req, res) => {
    db.get('SELECT id, name, email, phone, company_name, address, city, state, pincode, status FROM vendors WHERE id = ?', [req.session.vendorId], (err, vendor) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(vendor);
    });
});

// Update vendor profile
router.put('/', isAuthenticated, (req, res) => {
    const { name, phone, company_name, address, city, state, pincode } = req.body;

    db.run(
        `UPDATE vendors SET name = ?, phone = ?, company_name = ?, address = ?, city = ?, state = ?, pincode = ? 
         WHERE id = ?`,
        [name, phone, company_name, address, city, state, pincode, req.session.vendorId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update profile' });
            }
            res.json({ success: true, message: 'Profile updated' });
        }
    );
});

// Get dashboard statistics
router.get('/stats/dashboard', isAuthenticated, (req, res) => {
    db.serialize(() => {
        let stats = {
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0
        };

        db.get('SELECT COUNT(*) as count FROM products WHERE vendor_id = ?', [req.session.vendorId], (err, result) => {
            if (result) stats.totalProducts = result.count;
        });

        db.get('SELECT COUNT(*) as count FROM orders WHERE vendor_id = ?', [req.session.vendorId], (err, result) => {
            if (result) stats.totalOrders = result.count;
        });

        db.get('SELECT SUM(total_amount) as total FROM orders WHERE vendor_id = ?', [req.session.vendorId], (err, result) => {
            if (result && result.total) stats.totalRevenue = result.total;
        });

        db.get(`SELECT COUNT(*) as count FROM orders WHERE vendor_id = ? AND status = 'pending'`, [req.session.vendorId], (err, result) => {
            if (result) {
                stats.pendingOrders = result.count;
                res.json(stats);
            }
        });
    });
});

module.exports = router;
