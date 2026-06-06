const express = require('express');
const session = require('express-session');
const path = require('path');
const { initDb } = require('./init'); // Import initDb function

// Import route modules
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard1');
const shopRoutes = require('./shop');
const buyerRoutes = require('./buyer');
const ordersRoutes = require('./orders'); // Assuming orders.js exists and exports a router
const productsRoutes = require('./products'); // Assuming products.js exists and exports a router
const profileRoutes = require('./profile'); // Assuming profile.js exists and exports a router

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initDb().then(() => {
    console.log('Database initialized successfully.');
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1); // Exit if database initialization fails
});

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(session({
    secret: 'your_secret_key_here', // Replace with a strong, random secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files (HTML, CSS, client-side JS)
app.use(express.static(path.join(__dirname, ''))); // Serve files from the root directory

// API Routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/shop', shopRoutes);
app.use('/buyer', buyerRoutes);
app.use('/orders', ordersRoutes);
app.use('/products', productsRoutes);
app.use('/profile', profileRoutes);

// Unified API Routes to match all frontend fetch patterns
app.get('/api/products', (req, res) => {
    if (!req.session.vendorId) return res.status(401).json({ error: 'Unauthorized' });
    const { db } = require('./init');
    db.all('SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC', [req.session.vendorId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.get('/api/orders', (req, res) => {
    if (!req.session.vendorId) return res.status(401).json({ error: 'Unauthorized' });
    const { db } = require('./init');
    db.all('SELECT * FROM orders WHERE vendor_id = ? ORDER BY created_at DESC', [req.session.vendorId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const mappedRows = rows.map(r => ({
            id: r.id,
            buyer_name: r.customer_name,
            buyer_email: r.customer_email,
            total_amount: r.total_amount,
            quantity: 1,
            status: r.status
        }));
        res.json(mappedRows || []);
    });
});

app.get('/api/shop/products', (req, res) => {
    const { db } = require('./init');
    db.all('SELECT * FROM products WHERE status = ?', ['active'], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows || []);
    });
});

// Serve HTML files for specific routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.vendorId) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});

app.get('/profile', (req, res) => {
    if (!req.session.vendorId) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/orders', (req, res) => {
    if (!req.session.vendorId) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.sendFile(path.join(__dirname, 'orders.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/invoice', (req, res) => {
    res.sendFile(path.join(__dirname, 'invoice.html'));
});

app.get('/order-tracking', (req, res) => {
    res.sendFile(path.join(__dirname, 'order-tracking.html'));
});

// Default route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓✓✓ VENDORBRIDGE PROD SERVER RUNNING ON PORT ${PORT} ✓✓✓`);
});