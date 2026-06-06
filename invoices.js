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

// Generate Invoice from Purchase Order
router.post('/', isAuthenticated, (req, res) => {
    const { po_id } = req.body;
    const creatorId = req.session.userId || req.session.vendorId;
    const role = req.session.userRole;

    if (!po_id) {
        return res.status(400).json({ error: 'Purchase Order ID required' });
    }

    db.get('SELECT * FROM purchase_orders WHERE id = ?', [po_id], (err, po) => {
        if (err || !po) return res.status(404).json({ error: 'Purchase Order not found' });

        // Vendor or Officer can generate invoice
        if (role === 'vendor' && po.vendor_id !== creatorId) {
            return res.status(403).json({ error: 'Access denied: Unauthorized vendor' });
        }

        // Check if invoice already exists
        db.get('SELECT id FROM invoices WHERE po_id = ?', [po_id], (err, existingInv) => {
            if (existingInv) {
                return res.status(400).json({ error: 'Invoice already generated for this Purchase Order' });
            }

            // Generate Invoice Number (INV-2026-XXXX)
            db.get("SELECT COUNT(*) as count FROM invoices", (err, result) => {
                const count = (result ? result.count : 0) + 1;
                const invoiceNumber = `INV-2026-${String(count).padStart(4, '0')}`;

                db.run(
                    `INSERT INTO invoices (invoice_number, po_id, vendor_id, officer_id, subtotal, tax_amount, total_amount, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'unpaid')`,
                    [invoiceNumber, po_id, po.vendor_id, po.officer_id, po.total_amount, po.tax_amount, po.grand_total],
                    function(err) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Failed to generate Invoice' });
                        }

                        const invId = this.lastID;

                        // Log activity
                        db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
                            creatorId,
                            'Invoice Generated',
                            `Generated Invoice #${invoiceNumber} from PO #${po.po_number} (Total: ₹${po.grand_total.toFixed(2)})`
                        ]);

                        res.status(201).json({ success: true, message: 'Invoice generated successfully', invoiceId: invId, invoiceNumber });
                    }
                );
            });
        });
    });
});

// Get all Invoices
router.get('/', isAuthenticated, (req, res) => {
    const role = req.session.userRole;
    const userId = req.session.userId || req.session.vendorId;

    if (role === 'vendor') {
        db.all(`
            SELECT i.*, po.po_number, r.title as rfq_title
            FROM invoices i
            JOIN purchase_orders po ON i.po_id = po.id
            JOIN rfqs r ON po.rfq_id = r.id
            WHERE i.vendor_id = ?
            ORDER BY i.created_at DESC
        `, [userId], (err, invoices) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(invoices);
        });
    } else {
        db.all(`
            SELECT i.*, po.po_number, r.title as rfq_title, u_vendor.company_name as vendor_name
            FROM invoices i
            JOIN purchase_orders po ON i.po_id = po.id
            JOIN rfqs r ON po.rfq_id = r.id
            JOIN users u_vendor ON i.vendor_id = u_vendor.id
            ORDER BY i.created_at DESC
        `, (err, invoices) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(invoices);
        });
    }
});

// Get single Invoice details
router.get('/:id', isAuthenticated, (req, res) => {
    const invoiceId = req.params.id;
    const role = req.session.userRole;
    const userId = req.session.userId || req.session.vendorId;

    db.get(`
        SELECT i.*, po.po_number, po.created_at as po_date,
               r.title as rfq_title, r.description as rfq_desc, r.items as rfq_items,
               u_vendor.company_name as vendor_company, u_vendor.name as vendor_contact, u_vendor.email as vendor_email, 
               u_vendor.phone as vendor_phone, u_vendor.address as vendor_address, u_vendor.city as vendor_city,
               u_vendor.state as vendor_state, u_vendor.pincode as vendor_pincode, u_vendor.gst_number as vendor_gst,
               u_off.name as officer_name, u_off.email as officer_email, u_off.company_name as org_company,
               u_off.address as org_address, u_off.city as org_city, u_off.state as org_state, u_off.pincode as org_pincode
        FROM invoices i
        JOIN purchase_orders po ON i.po_id = po.id
        JOIN rfqs r ON po.rfq_id = r.id
        JOIN users u_vendor ON i.vendor_id = u_vendor.id
        JOIN users u_off ON i.officer_id = u_off.id
        WHERE i.id = ?
    `, [invoiceId], (err, invoice) => {
        if (err || !invoice) return res.status(404).json({ error: 'Invoice not found' });

        if (role === 'vendor' && invoice.vendor_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(invoice);
    });
});

// Update Invoice status (Paid/Unpaid/Void)
router.put('/:id/status', isAuthenticated, (req, res) => {
    const { status } = req.body;
    const invoiceId = req.params.id;
    const userId = req.session.userId || req.session.vendorId;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    db.run(
        'UPDATE invoices SET status = ? WHERE id = ?',
        [status, invoiceId],
        function(err) {
            if (err) return res.status(500).json({ error: 'Failed to update invoice status' });
            
            db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
                userId,
                'Invoice Status Updated',
                `Updated Invoice #${invoiceId} status to: ${status.toUpperCase()}`
            ]);

            res.json({ success: true, message: 'Invoice status updated successfully' });
        }
    );
});

// Mock Send Invoice via Email
router.post('/:id/email', isAuthenticated, (req, res) => {
    const invoiceId = req.params.id;
    const userId = req.session.userId || req.session.vendorId;

    db.get('SELECT * FROM invoices WHERE id = ?', [invoiceId], (err, invoice) => {
        if (err || !invoice) return res.status(404).json({ error: 'Invoice not found' });

        // Update DB field `sent_email = 1`
        db.run('UPDATE invoices SET sent_email = 1 WHERE id = ?', [invoiceId], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to update email status' });

            // Create notification log entry
            db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
                userId,
                'Email Sent',
                `Emailed Invoice #${invoice.invoice_number} successfully to recipient`
            ]);

            res.json({ success: true, message: `Invoice #${invoice.invoice_number} has been sent via email successfully (mocked).` });
        });
    });
});

module.exports = router;
