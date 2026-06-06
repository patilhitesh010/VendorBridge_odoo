const express = require('express');
const { db } = require('./init');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    const userId = req.session.userId || req.session.vendorId;
    if (userId) {
        next();
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};

// Get all activity logs for role
router.get('/', isAuthenticated, (req, res) => {
    const role = req.session.userRole;
    const userId = req.session.userId || req.session.vendorId;

    if (role === 'vendor') {
        db.all(`
            SELECT al.*, u.name as user_name
            FROM activity_logs al
            JOIN users u ON al.user_id = u.id
            WHERE al.user_id = ?
            ORDER BY al.created_at DESC
            LIMIT 50
        `, [userId], (err, logs) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(logs);
        });
    } else {
        // Staff see all activity logs
        db.all(`
            SELECT al.*, u.name as user_name, u.role as user_role
            FROM activity_logs al
            JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 100
        `, (err, logs) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(logs);
        });
    }
});

module.exports = router;
