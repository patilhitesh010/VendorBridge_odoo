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

// Get analytics summaries
router.get('/', isAuthenticated, (req, res) => {
    db.serialize(() => {
        const data = {
            monthlyTrends: [],
            categorySummary: [],
            vendorPerformance: []
        };
        let completed = 0;

        // 1. Monthly Trends (from purchase_orders)
        db.all(`
            SELECT strftime('%Y-%m', created_at) as month, SUM(grand_total) as total 
            FROM purchase_orders 
            WHERE status != 'cancelled' 
            GROUP BY month 
            ORDER BY month ASC
            LIMIT 12
        `, (err, rows) => {
            if (rows) data.monthlyTrends = rows;
            if (++completed === 3) res.json(data);
        });

        // 2. Spending summaries per vendor category
        db.all(`
            SELECT u.category, SUM(po.grand_total) as total
            FROM purchase_orders po
            JOIN users u ON po.vendor_id = u.id
            WHERE po.status != 'cancelled'
            GROUP BY u.category
        `, (err, rows) => {
            if (rows) data.categorySummary = rows;
            if (++completed === 3) res.json(data);
        });

        // 3. Vendor Performance analytics (aggregating quotation count, POs, and rating)
        db.all(`
            SELECT u.id, u.company_name, u.category, u.rating,
                   COUNT(DISTINCT q.id) as quotes_submitted,
                   COUNT(DISTINCT po.id) as pos_received,
                   COALESCE(SUM(po.grand_total), 0) as total_business
            FROM users u
            LEFT JOIN quotations q ON u.id = q.vendor_id
            LEFT JOIN purchase_orders po ON u.id = po.vendor_id AND po.status != 'cancelled'
            WHERE u.role = 'vendor'
            GROUP BY u.id
            ORDER BY u.rating DESC
        `, (err, rows) => {
            if (rows) data.vendorPerformance = rows;
            if (++completed === 3) res.json(data);
        });
    });
});

// Export reports as CSV
router.get('/export', isAuthenticated, (req, res) => {
    db.all(`
        SELECT po.po_number, po.grand_total, po.created_at, po.status, 
               r.title as rfq_title, 
               u_vendor.company_name as vendor_name, u_vendor.category as vendor_category,
               u_off.name as officer_name
        FROM purchase_orders po
        JOIN rfqs r ON po.rfq_id = r.id
        JOIN users u_vendor ON po.vendor_id = u_vendor.id
        JOIN users u_off ON po.officer_id = u_off.id
        ORDER BY po.created_at DESC
    `, (err, rows) => {
        if (err) return res.status(500).send('Error generating report');

        let csv = 'PO Number,RFQ Title,Vendor,Category,Grand Total,Created At,Status,Issued By\n';
        rows.forEach(r => {
            csv += `"${r.po_number}","${r.rfq_title.replace(/"/g, '""')}","${r.vendor_name.replace(/"/g, '""')}","${r.vendor_category || ''}",${r.grand_total},"${r.created_at}","${r.status}","${r.officer_name}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="procurement_report.csv"');
        res.status(200).send(csv);
    });
});

module.exports = router;
