const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { db } = require('./init');

// Registration
router.post('/register', async (req, res) => {
    const { vendor_name, company_name, email, phone, address, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO vendors (vendor_name, company_name, email, phone, address, password) VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [vendor_name, company_name, email, phone, address, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).send('Email already registered');
                }
                return res.status(500).send('Error registering vendor');
            }
            res.redirect('/login?registered=true');
        });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM vendors WHERE email = ?', [email], async (err, vendor) => {
        if (err) return res.status(500).send('Server error');
        if (!vendor) return res.status(400).send('Invalid email or password');
        
        const match = await bcrypt.compare(password, vendor.password);
        if (match) {
            req.session.vendorId = vendor.id;
            req.session.vendorName = vendor.vendor_name;
            res.redirect('/dashboard');
        } else {
            res.status(400).send('Invalid email or password');
        }
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Get current session status
router.get('/status', (req, res) => {
    if (req.session.vendorId) {
        res.json({ loggedIn: true, vendorName: req.session.vendorName });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;