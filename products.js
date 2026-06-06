const express = require('express');
const router = express.Router();
const { db } = require('./init');

// Get all products for the logged-in vendor
router.get('/list', (req, res) => {
    if (!req.session.vendorId) return res.status(401).json({ error: 'Unauthorized' });
    
    db.all('SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC', [req.session.vendorId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add a new product
router.post('/add', (req, res) => {
    if (!req.session.vendorId) return res.status(401).send('Unauthorized');
    
    const { name, sku, price, stock, description } = req.body;
    const vendorId = req.session.vendorId;
    
    db.run(`INSERT INTO products (vendor_id, name, sku, price, stock, description) VALUES (?, ?, ?, ?, ?, ?)`,
        [vendorId, name, sku, price, stock, description],
        function(err) {
            if (err) return res.status(500).send('Error adding product: ' + err.message);
            res.redirect('/products');
        }
    );
});

// Edit a product
router.post('/edit/:id', (req, res) => {
    if (!req.session.vendorId) return res.status(401).send('Unauthorized');
    
    const { name, sku, price, stock, description } = req.body;
    const productId = req.params.id;
    const vendorId = req.session.vendorId;
    
    db.run(`UPDATE products SET name = ?, sku = ?, price = ?, stock = ?, description = ? WHERE id = ? AND vendor_id = ?`,
        [name, sku, price, stock, description, productId, vendorId],
        function(err) {
            if (err) return res.status(500).send('Error updating product');
            res.redirect('/products');
        }
    );
});

// Delete a product
router.post('/delete/:id', (req, res) => {
    if (!req.session.vendorId) return res.status(401).send('Unauthorized');
    
    const productId = req.params.id;
    const vendorId = req.session.vendorId;
    
    db.run(`DELETE FROM products WHERE id = ? AND vendor_id = ?`, [productId, vendorId], function(err) {
        if (err) return res.status(500).send('Error deleting product');
        res.redirect('/products');
    });
});

module.exports = router;