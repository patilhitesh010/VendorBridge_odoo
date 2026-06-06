const express = require('express');
const { db } = require('../db/init');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    const userId = req.session.userId || req.session.vendorId;
    if (userId) {
        next();
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};

const isStaff = (req, res, next) => {
    const role = req.session.userRole;
    if (role === 'officer' || role === 'admin' || role === 'manager') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
};

// List all vendors (with optional search and filters)
router.get('/', isAuthenticated, isStaff, (req, res) => {
    const { category, status, search } = req.query;
    let query = "SELECT id, name, email, phone, company_name, address, city, state, pincode, status, gst_number, category, rating, created_at FROM users WHERE role = 'vendor'";
    const params = [];

    if (category) {
        query += " AND category = ?";
        params.push(category);
    }
    if (status) {
        query += " AND status = ?";
        params.push(status);
    }
    if (search) {
        query += " AND (name LIKE ? OR company_name LIKE ? OR email LIKE ?)";
        const likeParam = `%${search}%`;
        params.push(likeParam, likeParam, likeParam);
    }

    query += " ORDER BY company_name ASC";

    db.all(query, params, (err, vendors) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(vendors);
    });
});

// Update vendor status (active, suspended, pending)
router.put('/:id/status', isAuthenticated, isStaff, (req, res) => {
    const vendorId = req.params.id;
    const { status } = req.body;
    const staffId = req.session.userId || req.session.vendorId;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    db.run(
        'UPDATE users SET status = ? WHERE id = ? AND role = "vendor"',
        [status, vendorId],
        function(err) {
            if (err) return res.status(500).json({ error: 'Failed to update vendor status' });
            if (this.changes === 0) return res.status(404).json({ error: 'Vendor not found' });

            // Log activity
            db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
                staffId,
                'Vendor Status Updated',
                `Updated Vendor #${vendorId} status to: ${status.toUpperCase()}`
            ]);

            res.json({ success: true, message: 'Vendor status updated successfully' });
        }
    );
});

module.exports = router;
