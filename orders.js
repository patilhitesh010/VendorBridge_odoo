const express = require('express');
const router = express.Router();
const { db } = require('./init');

// Get all orders for the logged-in vendor
router.get('/list', (req, res) => {
    if (!req.session.vendorId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { search, status } = req.query;
    let sql = 'SELECT * FROM orders WHERE vendor_id = ?';
    let params = [req.session.vendorId];

    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }

    if (search) {
        sql += ' AND (customer_name LIKE ? OR id LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update order status and tracking
router.post('/update/:id', (req, res) => {
    if (!req.session.vendorId) return res.status(401).send('Unauthorized');
    
    const { status, tracking_number } = req.body;
    const orderId = req.params.id;
    const vendorId = req.session.vendorId;
    
    db.run(`UPDATE orders SET status = ?, tracking_number = ? WHERE id = ? AND vendor_id = ?`,
        [status, tracking_number, orderId, vendorId],
        function(err) {
            if (err) return res.status(500).send('Error updating order');
            res.redirect('/orders');
        }
    );
});

module.exports = router;