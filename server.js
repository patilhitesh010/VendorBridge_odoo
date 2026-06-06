const express = require('express');
const session = require('express-session');
const path = require('path');
const { initDb } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: 'vendorbridge-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Protected route middleware
const isAuthenticated = (req, res, next) => {
    // Both req.session.userId and req.session.vendorId are checked to preserve compatibility
    if (req.session.userId || req.session.vendorId) {
        next();
    } else if (req.path.startsWith('/api/')) {
        res.status(401).json({ error: 'Not authenticated' });
    } else {
        res.redirect('/login');
    }
};

// Home route
app.get('/', (req, res) => {
    if (req.session.userId || req.session.vendorId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'views/home.html'));
    }
});

// Import Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes = require('./routes/profile');
const rfqRoutes = require('./routes/rfqs');
const quoteRoutes = require('./routes/quotations');
const approvalRoutes = require('./routes/approvals');
const poRoutes = require('./routes/pos');
const invoiceRoutes = require('./routes/invoices');
const logRoutes = require('./routes/logs');
const analyticsRoutes = require('./routes/analytics');
const vendorRoutes = require('./routes/vendors');

// API Routes
app.use('/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/quotations', quoteRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/pos', poRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/vendors', vendorRoutes);

// Serve HTML pages
app.get('/register', (req, res) => {
    if (req.session.userId || req.session.vendorId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'views/register.html'));
    }
});

app.get('/login', (req, res) => {
    if (req.session.userId || req.session.vendorId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'views/login.html'));
    }
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

app.get('/vendors', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/vendors.html'));
});

app.get('/rfqs', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/rfqs.html'));
});

app.get('/quotations', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/quotations.html'));
});

app.get('/approvals', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/approvals.html'));
});

app.get('/purchase-orders', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/purchase-orders.html'));
});

app.get('/invoice', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/invoice.html'));
});

app.get('/logs', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/logs.html'));
});

app.get('/reports', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/reports.html'));
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/profile.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize DB and Start Server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`✓ VendorBridge server is running on http://localhost:${PORT}`);
        console.log(`✓ Database initialized successfully`);
    });
}).catch(err => {
    console.error('✗ Failed to initialize database:', err);
    process.exit(1);
});