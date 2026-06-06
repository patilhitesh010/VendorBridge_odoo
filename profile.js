const express = require('express');
const router = express.Router();
const { db } = require('../db/init');

// Get current vendor profile
router.get('/data', (req, res) => {
    if (!req.session.vendorId) return res.status(401).json({ error: 'Unauthorized' });
    
    db.get('SELECT vendor_name, company_name, email, phone, address FROM vendors WHERE id = ?', [req.session.vendorId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// Update vendor profile
router.post('/update', (req, res) => {
    if (!req.session.vendorId) return res.status(401).send('Unauthorized');
    
    const { vendor_name, company_name, phone, address } = req.body;
    const vendorId = req.session.vendorId;
    
    db.run(`UPDATE vendors SET vendor_name = ?, company_name = ?, phone = ?, address = ? WHERE id = ?`,
        [vendor_name, company_name, phone, address, vendorId],
        function(err) {
            if (err) return res.status(500).send('Error updating profile');
            req.session.vendorName = vendor_name; // Update session name
            res.redirect('/profile?updated=true');
        }
    );
});

module.exports = router;