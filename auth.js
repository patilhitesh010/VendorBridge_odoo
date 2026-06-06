const express = require('express');
const bcrypt = require('bcrypt');
const { db } = require('../db/init');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    const { name, email, password, phone, company_name, address, city, state, pincode } = req.body;

    if (!name || !email || !password || !company_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            `INSERT INTO vendors (name, email, password, phone, company_name, address, city, state, pincode) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, phone, company_name, address, city, state, pincode],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ error: 'Email already registered' });
                    }
                    return res.status(500).json({ error: 'Registration failed' });
                }
                res.status(201).json({ success: true, message: 'Registration successful', vendorId: this.lastID });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    db.get('SELECT * FROM vendors WHERE email = ?', [email], async (err, vendor) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }

        if (!vendor) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        try {
            const passwordMatch = await bcrypt.compare(password, vendor.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            req.session.vendorId = vendor.id;
            req.session.vendorName = vendor.name;
            req.session.vendorEmail = vendor.email;

            res.json({ success: true, message: 'Login successful', vendorId: vendor.id });
        } catch (error) {
            res.status(500).json({ error: 'Server error during login' });
        }
    });
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Get current vendor info
router.get('/vendor-info', (req, res) => {
    if (!req.session.vendorId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    db.get('SELECT id, name, email, phone, company_name, address, city, state, pincode FROM vendors WHERE id = ?', [req.session.vendorId], (err, vendor) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(vendor);
    });
});

module.exports = router;
