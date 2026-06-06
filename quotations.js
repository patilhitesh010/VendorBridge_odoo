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

// Vendor submits a quotation
router.post('/', isAuthenticated, (req, res) => {
    const { rfq_id, price, delivery_timeline, notes } = req.body;
    const vendorId = req.session.userId || req.session.vendorId;

    if (!rfq_id || !price || !delivery_timeline) {
        return res.status(400).json({ error: 'Missing pricing or delivery timeline details' });
    }

    // Verify assignment
    db.get('SELECT id FROM rfq_assignments WHERE rfq_id = ? AND vendor_id = ?', [rfq_id, vendorId], (err, assignment) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!assignment) return res.status(403).json({ error: 'You are not assigned to this RFQ' });

        // Check if quotation already exists
        db.get('SELECT id FROM quotations WHERE rfq_id = ? AND vendor_id = ?', [rfq_id, vendorId], (err, existing) => {
            if (existing) {
                // Update instead
                db.run(
                    `UPDATE quotations SET price = ?, delivery_timeline = ?, notes = ?, status = 'revised' 
                     WHERE id = ?`,
                    [price, delivery_timeline, notes, existing.id],
                    function(err) {
                        if (err) return res.status(500).json({ error: 'Failed to update quotation' });
                        
                        db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
                            vendorId,
                            'Quotation Revised',
                            `Revised quote for RFQ #${rfq_id}: Price ₹${price}, Timeline: ${delivery_timeline}`
                        ]);

                        res.json({ success: true, message: 'Quotation updated successfully', quotationId: existing.id });
                    }
                );
            } else {
                // Insert new
                db.run(
                    `INSERT INTO quotations (rfq_id, vendor_id, price, delivery_timeline, notes, status) 
                     VALUES (?, ?, ?, ?, ?, 'submitted')`,
                    [rfq_id, vendorId, price, delivery_timeline, notes],
                    function(err) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Failed to submit quotation' });
                        }

                        db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
                            vendorId,
                            'Quotation Submitted',
                            `Submitted quote for RFQ #${rfq_id}: Price ₹${price}, Timeline: ${delivery_timeline}`
                        ]);

                        res.status(201).json({ success: true, message: 'Quotation submitted successfully', quotationId: this.lastID });
                    }
                );
            }
        });
    });
});

// Compare quotations side-by-side for an RFQ
router.get('/compare/:rfqId', isAuthenticated, (req, res) => {
    const rfqId = req.params.rfqId;
    
    db.all(`
        SELECT q.*, u.name as vendor_name, u.company_name, u.gst_number, u.category, u.rating as vendor_rating
        FROM quotations q
        JOIN users u ON q.vendor_id = u.id
        WHERE q.rfq_id = ?
        ORDER BY q.price ASC
    `, [rfqId], (err, quotes) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Highlight lowest price
        let lowestPrice = Infinity;
        if (quotes.length > 0) {
            lowestPrice = Math.min(...quotes.map(q => q.price));
            quotes.forEach(q => {
                q.is_lowest = (q.price === lowestPrice);
            });
        }

        db.get('SELECT * FROM rfqs WHERE id = ?', [rfqId], (err, rfq) => {
            res.json({ rfq, quotations: quotes });
        });
    });
});

module.exports = router;
