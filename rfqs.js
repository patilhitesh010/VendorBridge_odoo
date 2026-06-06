const express = require('express');
const { db } = require('../db/init');

const router = express.Router();

// Check if authenticated
const isAuthenticated = (req, res, next) => {
    const userId = req.session.userId || req.session.vendorId;
    if (userId) {
        next();
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};

// Check if Procurement Officer
const isOfficer = (req, res, next) => {
    if (req.session.userRole === 'officer' || req.session.userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Procurement Officer role required' });
    }
};

// Get all RFQs
router.get('/', isAuthenticated, (req, res) => {
    const role = req.session.userRole;
    const userId = req.session.userId || req.session.vendorId;

    if (role === 'vendor') {
        // Return RFQs assigned to this vendor
        db.all(`
            SELECT r.*, ra.id as assignment_id 
            FROM rfqs r 
            JOIN rfq_assignments ra ON r.id = ra.rfq_id 
            WHERE ra.vendor_id = ?
            ORDER BY r.created_at DESC
        `, [userId], (err, rfqs) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to fetch RFQs' });
            }
            res.json(rfqs);
        });
    } else {
        // Procurement Officer, Manager, Admin can view all RFQs
        db.all('SELECT r.*, u.name as creator_name FROM rfqs r JOIN users u ON r.created_by = u.id ORDER BY r.created_at DESC', (err, rfqs) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to fetch RFQs' });
            }
            res.json(rfqs);
        });
    }
});

// Get single RFQ detail
router.get('/:id', isAuthenticated, (req, res) => {
    const rfqId = req.params.id;
    const role = req.session.userRole;
    const userId = req.session.userId || req.session.vendorId;

    db.get('SELECT r.*, u.name as creator_name FROM rfqs r JOIN users u ON r.created_by = u.id WHERE r.id = ?', [rfqId], (err, rfq) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!rfq) {
            return res.status(404).json({ error: 'RFQ not found' });
        }

        // For vendors, verify they are assigned
        if (role === 'vendor') {
            db.get('SELECT id FROM rfq_assignments WHERE rfq_id = ? AND vendor_id = ?', [rfqId, userId], (err, assignment) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                if (!assignment) return res.status(403).json({ error: 'Unauthorized to view this RFQ' });
                
                // Return RFQ and vendor's submission if any
                db.get('SELECT * FROM quotations WHERE rfq_id = ? AND vendor_id = ?', [rfqId, userId], (err, quotation) => {
                    res.json({ rfq, quotation: quotation || null });
                });
            });
        } else {
            // Return RFQ, assignments (with vendor info), and all submitted quotations
            db.all(`
                SELECT ra.vendor_id, u.name, u.company_name, u.email 
                FROM rfq_assignments ra 
                JOIN users u ON ra.vendor_id = u.id 
                WHERE ra.rfq_id = ?
            `, [rfqId], (err, assignments) => {
                db.all(`
                    SELECT q.*, u.company_name as vendor_name, u.rating as vendor_rating
                    FROM quotations q
                    JOIN users u ON q.vendor_id = u.id
                    WHERE q.rfq_id = ?
                `, [rfqId], (err, quotations) => {
                    res.json({ rfq, assignments, quotations });
                });
            });
        }
    });
});

// Create RFQ (Officer only)
router.post('/', isAuthenticated, isOfficer, (req, res) => {
    const { title, description, items, deadline, vendorIds } = req.body;
    const creatorId = req.session.userId || req.session.vendorId;

    if (!title || !items || !deadline || !vendorIds || !Array.isArray(vendorIds)) {
        return res.status(400).json({ error: 'Missing required fields or invalid vendor assignments' });
    }

    db.run(
        `INSERT INTO rfqs (title, description, items, deadline, status, created_by) 
         VALUES (?, ?, ?, ?, 'active', ?)`,
        [title, description, JSON.stringify(items), deadline, creatorId],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to create RFQ' });
            }

            const rfqId = this.lastID;
            
            // Insert vendor assignments
            const stmt = db.prepare('INSERT INTO rfq_assignments (rfq_id, vendor_id) VALUES (?, ?)');
            vendorIds.forEach(vendorId => {
                stmt.run(rfqId, vendorId);
            });
            stmt.finalize();

            // Log activity
            db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
                creatorId,
                'RFQ Created',
                `Created RFQ #${rfqId}: "${title}" assigned to ${vendorIds.length} vendors.`
            ]);

            res.status(201).json({ success: true, message: 'RFQ created successfully', rfqId });
        }
    );
});

// Close/Delete RFQ (Officer only)
router.delete('/:id', isAuthenticated, isOfficer, (req, res) => {
    const rfqId = req.params.id;
    const userId = req.session.userId || req.session.vendorId;

    db.run('UPDATE rfqs SET status = "closed" WHERE id = ?', [rfqId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to close RFQ' });
        }
        
        db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
            userId,
            'RFQ Closed',
            `RFQ #${rfqId} has been closed`
        ]);

        res.json({ success: true, message: 'RFQ closed successfully' });
    });
});

module.exports = router;
