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

const isOfficer = (req, res, next) => {
    if (req.session.userRole === 'officer' || req.session.userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Procurement Officer role required' });
    }
};

// Generate Purchase Order from Approved Quotation
router.post('/', isAuthenticated, isOfficer, (req, res) => {
    const { quotation_id } = req.body;
    const officerId = req.session.userId || req.session.vendorId;

    if (!quotation_id) {
        return res.status(400).json({ error: 'Quotation ID required' });
    }

    // Get quotation details
    db.get('SELECT * FROM quotations WHERE id = ?', [quotation_id], (err, quote) => {
        if (err || !quote) return res.status(404).json({ error: 'Quotation not found' });

        if (quote.status !== 'approved') {
            return res.status(400).json({ error: 'Quotation must be approved before generating a Purchase Order' });
        }

        // Check if PO already exists for this quotation
        db.get('SELECT id FROM purchase_orders WHERE quotation_id = ?', [quotation_id], (err, existingPo) => {
            if (existingPo) {
                return res.status(400).json({ error: 'Purchase Order already generated for this quotation' });
            }

            // Generate PO Number (PO-2026-XXXX)
            db.get("SELECT COUNT(*) as count FROM purchase_orders", (err, result) => {
                const count = (result ? result.count : 0) + 1;
                const poNumber = `PO-2026-${String(count).padStart(4, '0')}`;

                const price = quote.price;
                const taxAmount = price * 0.18; // 18% GST calculation
                const grandTotal = price + taxAmount;

                db.run(
                    `INSERT INTO purchase_orders (po_number, rfq_id, quotation_id, vendor_id, officer_id, total_amount, tax_amount, grand_total, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'issued')`,
                    [poNumber, quote.rfq_id, quotation_id, quote.vendor_id, officerId, price, taxAmount, grandTotal],
                    function(err) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Failed to generate Purchase Order' });
                        }

                        const poId = this.lastID;

                        // Log activity
                        db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
                            officerId,
                            'Purchase Order Generated',
                            `Generated PO #${poNumber} for Quotation #${quotation_id} (Total: ₹${grandTotal.toFixed(2)})`
                        ]);

                        res.status(201).json({ success: true, message: 'Purchase Order generated successfully', poId, poNumber });
                    }
                );
            });
        });
    });
});

// Get all Purchase Orders
router.get('/', isAuthenticated, (req, res) => {
    const role = req.session.userRole;
    const userId = req.session.userId || req.session.vendorId;

    if (role === 'vendor') {
        db.all(`
            SELECT po.*, r.title as rfq_title, u.name as officer_name
            FROM purchase_orders po
            JOIN rfqs r ON po.rfq_id = r.id
            JOIN users u ON po.officer_id = u.id
            WHERE po.vendor_id = ?
            ORDER BY po.created_at DESC
        `, [userId], (err, pos) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(pos);
        });
    } else {
        db.all(`
            SELECT po.*, r.title as rfq_title, u_vendor.company_name as vendor_name, u_off.name as officer_name
            FROM purchase_orders po
            JOIN rfqs r ON po.rfq_id = r.id
            JOIN users u_vendor ON po.vendor_id = u_vendor.id
            JOIN users u_off ON po.officer_id = u_off.id
            ORDER BY po.created_at DESC
        `, (err, pos) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(pos);
        });
    }
});

// Get single PO details
router.get('/:id', isAuthenticated, (req, res) => {
    const poId = req.params.id;
    const role = req.session.userRole;
    const userId = req.session.userId || req.session.vendorId;

    db.get(`
        SELECT po.*, r.title as rfq_title, r.description as rfq_desc, r.items as rfq_items,
               u_vendor.company_name as vendor_company, u_vendor.name as vendor_contact, u_vendor.email as vendor_email, 
               u_vendor.phone as vendor_phone, u_vendor.address as vendor_address, u_vendor.city as vendor_city,
               u_vendor.state as vendor_state, u_vendor.pincode as vendor_pincode, u_vendor.gst_number as vendor_gst,
               u_off.name as officer_name, u_off.email as officer_email
        FROM purchase_orders po
        JOIN rfqs r ON po.rfq_id = r.id
        JOIN users u_vendor ON po.vendor_id = u_vendor.id
        JOIN users u_off ON po.officer_id = u_off.id
        WHERE po.id = ?
    `, [poId], (err, po) => {
        if (err || !po) return res.status(404).json({ error: 'Purchase Order not found' });

        if (role === 'vendor' && po.vendor_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if invoice has been generated for this PO
        db.get('SELECT id, invoice_number FROM invoices WHERE po_id = ?', [poId], (err, inv) => {
            res.json({ po, invoice: inv || null });
        });
    });
});

module.exports = router;
