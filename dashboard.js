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

// Get dashboard stats
router.get('/', isAuthenticated, (req, res) => {
    db.serialize(() => {
        let stats = {
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0
        };
        let queriesCompleted = 0;

        db.get('SELECT COUNT(*) as count FROM products WHERE vendor_id = ?', [req.session.vendorId], (err, result) => {
            if (result) stats.totalProducts = result.count;
            queriesCompleted++;
            if (queriesCompleted === 4) res.json(stats);
        });

        db.get('SELECT COUNT(*) as count FROM orders WHERE vendor_id = ?', [req.session.vendorId], (err, result) => {
            if (result) stats.totalOrders = result.count;
            queriesCompleted++;
            if (queriesCompleted === 4) res.json(stats);
        });

        db.get('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE vendor_id = ?', [req.session.vendorId], (err, result) => {
            if (result) stats.totalRevenue = result.total;
            queriesCompleted++;
            if (queriesCompleted === 4) res.json(stats);
        });

        db.get(`SELECT COUNT(*) as count FROM orders WHERE vendor_id = ? AND status = 'pending'`, [req.session.vendorId], (err, result) => {
            if (result) stats.pendingOrders = result.count;
            queriesCompleted++;
            if (queriesCompleted === 4) res.json(stats);
        });
    });
});

module.exports = router;
