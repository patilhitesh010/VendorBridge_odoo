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

// Get all products of vendor
router.get('/', isAuthenticated, (req, res) => {
    db.all('SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC', [req.session.vendorId], (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(products);
    });
});

// Get single product
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    });
});

// Add new product
router.post('/', isAuthenticated, (req, res) => {
    const { name, description, category, price, quantity, image_url } = req.body;

    if (!name || !category || !price || quantity === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
        `INSERT INTO products (vendor_id, name, description, category, price, quantity, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.session.vendorId, name, description, category, price, quantity, image_url || null],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to add product' });
            }
            res.status(201).json({ success: true, message: 'Product added', productId: this.lastID });
        }
    );
});

// Update product
router.put('/:id', isAuthenticated, (req, res) => {
    const { name, description, category, price, quantity, image_url } = req.body;

    db.run(
        `UPDATE products SET name = ?, description = ?, category = ?, price = ?, quantity = ?, image_url = ? 
         WHERE id = ? AND vendor_id = ?`,
        [name, description, category, price, quantity, image_url || null, req.params.id, req.session.vendorId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update product' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Product not found or unauthorized' });
            }
            res.json({ success: true, message: 'Product updated' });
        }
    );
});

// Delete product
router.delete('/:id', isAuthenticated, (req, res) => {
    db.run('DELETE FROM products WHERE id = ? AND vendor_id = ?', [req.params.id, req.session.vendorId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete product' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found or unauthorized' });
        }
        res.json({ success: true, message: 'Product deleted' });
    });
});

module.exports = router;
