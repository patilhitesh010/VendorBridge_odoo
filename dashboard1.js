const express = require('express');
const router = express.Router();
const { db } = require('../db/init');

router.get('/stats', (req, res) => {
    if (!req.session.vendorId) return res.status(401).json({ error: 'Unauthorized' });
    
    const vendorId = req.session.vendorId;
    const stats = {};

    db.get('SELECT COUNT(*) as count FROM products WHERE vendor_id = ?', [vendorId], (err, row) => {
        stats.totalProducts = row ? row.count : 0;
        
        db.get('SELECT COUNT(*) as count FROM orders WHERE vendor_id = ?', [vendorId], (err, row) => {
            stats.totalOrders = row ? row.count : 0;
            
            db.get("SELECT COUNT(*) as count FROM orders WHERE vendor_id = ? AND status = 'pending'", [vendorId], (err, row) => {
                stats.pendingOrders = row ? row.count : 0;
                
                db.get("SELECT COUNT(*) as count FROM orders WHERE vendor_id = ? AND status = 'shipped'", [vendorId], (err, row) => {
                    stats.shippedOrders = row ? row.count : 0;
                    
                    db.all("SELECT * FROM orders WHERE vendor_id = ? ORDER BY created_at DESC LIMIT 5", [vendorId], (err, rows) => {
                        stats.recentOrders = rows || [];
                        res.json(stats);
                    });
                });
            });
        });
    });
});

module.exports = router;