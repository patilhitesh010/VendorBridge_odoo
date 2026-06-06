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

const isManager = (req, res, next) => {
    if (req.session.userRole === 'manager' || req.session.userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Manager role required' });
    }
};

// Officer submits quotation for approval
router.post('/', isAuthenticated, (req, res) => {
    const { rfq_id, quotation_id } = req.body;
    const officerId = req.session.userId || req.session.vendorId;

    if (!rfq_id || !quotation_id) {
        return res.status(400).json({ error: 'Missing RFQ ID or Quotation ID' });
    }

    db.serialize(() => {
        // Insert approval record
        db.run(
            `INSERT INTO approvals (rfq_id, quotation_id, status) VALUES (?, ?, 'pending')`,
            [rfq_id, quotation_id],
            function(err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to initiate approval workflow' });
                }
                const approvalId = this.lastID;

                // Update quotation status to 'under_review'
                db.run("UPDATE quotations SET status = 'under_review' WHERE id = ?", [quotation_id]);

                // Update RFQ status to 'under_review'
                db.run("UPDATE rfqs SET status = 'under_review' WHERE id = ?", [rfq_id]);

                // Log activity
                db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
                    officerId,
                    'Approval Request Initiated',
                    `Submitted Quotation #${quotation_id} for RFQ #${rfq_id} for management approval.`
                ]);

                res.status(201).json({ success: true, message: 'Approval workflow initiated', approvalId });
            }
        );
    });
});

// List all approvals (optionally filtered by status)
router.get('/', isAuthenticated, (req, res) => {
    const status = req.query.status || 'pending';
    
    db.all(`
        SELECT a.*, r.title as rfq_title, q.price, q.delivery_timeline, u.company_name as vendor_name, u_manager.name as manager_name
        FROM approvals a
        JOIN rfqs r ON a.rfq_id = r.id
        JOIN quotations q ON a.quotation_id = q.id
        JOIN users u ON q.vendor_id = u.id
        LEFT JOIN users u_manager ON a.manager_id = u_manager.id
        WHERE a.status = ?
        ORDER BY a.created_at DESC
    `, [status], (err, approvals) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(approvals);
    });
});

// Manager reviews (approves/rejects) approval request
router.put('/:id', isAuthenticated, isManager, (req, res) => {
    const approvalId = req.params.id;
    const { status, remarks } = req.body;
    const managerId = req.session.userId || req.session.vendorId;

    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status (must be approved or rejected)' });
    }

    db.get('SELECT * FROM approvals WHERE id = ?', [approvalId], (err, approval) => {
        if (err || !approval) return res.status(404).json({ error: 'Approval request not found' });

        const { rfq_id, quotation_id } = approval;

        db.serialize(() => {
            // Update approval status
            db.run(
                'UPDATE approvals SET status = ?, remarks = ?, manager_id = ? WHERE id = ?',
                [status, remarks || '', managerId, approvalId]
            );

            // Update Quotation status
            db.run(
                'UPDATE quotations SET status = ? WHERE id = ?',
                [status === 'approved' ? 'approved' : 'rejected', quotation_id]
            );

            // Update RFQ status
            db.run(
                'UPDATE rfqs SET status = ? WHERE id = ?',
                [status === 'approved' ? 'approved' : 'active', rfq_id]
            );

            // If approved, reject all other quotations for the same RFQ
            if (status === 'approved') {
                db.run('UPDATE quotations SET status = "rejected" WHERE rfq_id = ? AND id != ?', [rfq_id, quotation_id]);
            }

            // Log activity
            db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
                managerId,
                status === 'approved' ? 'Request Approved' : 'Request Rejected',
                `Approval #${approvalId}: ${status.toUpperCase()} quotation #${quotation_id} for RFQ #${rfq_id}. Remarks: ${remarks || 'None'}`
            ]);

            res.json({ success: true, message: `Request successfully ${status}` });
        });
    });
});

module.exports = router;
