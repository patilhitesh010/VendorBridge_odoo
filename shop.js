const express = require('express');
const { db } = require('./init');

const router = express.Router();

// Get all products from all vendors (public)
router.get('/products', (req, res) => {
    db.all('SELECT id, vendor_id, name, description, category, price, quantity, image_url FROM products WHERE status = ? ORDER BY created_at DESC', ['active'], (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(products || []);
    });
});

module.exports = router;
