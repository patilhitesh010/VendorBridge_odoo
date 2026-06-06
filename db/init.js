const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, '../data/vendorbridge.db');
const db = new sqlite3.Database(dbPath);

async function initDb() {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            // Vendors table
            db.run(`CREATE TABLE IF NOT EXISTS vendors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vendor_name TEXT NOT NULL,
                company_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                address TEXT,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Products table
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vendor_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                sku TEXT UNIQUE NOT NULL,
                price REAL NOT NULL,
                stock INTEGER DEFAULT 0,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vendor_id) REFERENCES vendors (id)
            )`);

            // Orders table
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vendor_id INTEGER NOT NULL,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                tracking_number TEXT,
                total_amount REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vendor_id) REFERENCES vendors (id)
            )`);

            // Order items table
            db.run(`CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders (id),
                FOREIGN KEY (product_id) REFERENCES products (id)
            )`);

            // Seed Data
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('password123', saltRounds);

            // Check if demo vendor exists
            db.get("SELECT id FROM vendors WHERE email = ?", ['demo@vendorbridge.com'], async (err, row) => {
                if (!row) {
                    db.run(`INSERT INTO vendors (vendor_name, company_name, email, phone, address, password) 
                           VALUES (?, ?, ?, ?, ?, ?)`, 
                           ['Demo Vendor', 'Demo Corp', 'demo@vendorbridge.com', '123-456-7890', '123 Main St, Tech City', hashedPassword],
                           function(err) {
                               if (err) return console.error(err.message);
                               const vendorId = this.lastID;
                               console.log('Demo vendor created');

                               // Seed Products
                               const products = [
                                   ['Wireless Mouse', 'WM-001', 25.99, 100, 'Ergonomic wireless mouse'],
                                   ['Mechanical Keyboard', 'MK-002', 89.50, 50, 'RGB mechanical keyboard'],
                                   ['USB-C Hub', 'UH-003', 45.00, 75, '7-in-1 USB-C docking station'],
                                   ['Webcam 1080p', 'WC-004', 59.99, 30, 'High definition streaming webcam'],
                                   ['Laptop Stand', 'LS-005', 35.00, 40, 'Adjustable aluminum laptop stand'],
                                   ['Noise Cancelling Headphones', 'NH-006', 199.99, 20, 'Premium wireless headphones'],
                                   ['Monitor Arm', 'MA-007', 49.99, 15, 'Single monitor gas spring arm'],
                                   ['Desk Mat', 'DM-008', 15.50, 120, 'Large waterproof desk protector']
                               ];

                               const productStmt = db.prepare(`INSERT INTO products (vendor_id, name, sku, price, stock, description) VALUES (?, ?, ?, ?, ?, ?)`);
                               products.forEach(p => productStmt.run(vendorId, ...p));
                               productStmt.finalize();
                               console.log('Sample products seeded');

                               // Seed Orders
                               const orders = [
                                   ['John Doe', 'john@example.com', 'pending', null, 51.98],
                                   ['Jane Smith', 'jane@test.com', 'shipped', 'TRK123456', 89.50],
                                   ['Alice Johnson', 'alice@email.com', 'delivered', 'TRK789012', 45.00],
                                   ['Bob Brown', 'bob@work.com', 'cancelled', null, 35.00],
                                   ['Charlie Davis', 'charlie@home.com', 'accepted', null, 119.98],
                                   ['Eve Wilson', 'eve@example.com', 'packed', null, 59.99],
                                   ['Frank Miller', 'frank@test.com', 'pending', null, 25.99],
                                   ['Grace Lee', 'grace@email.com', 'shipped', 'TRK345678', 199.99],
                                   ['Henry Ford', 'henry@work.com', 'delivered', 'TRK901234', 15.50],
                                   ['Ivy Chen', 'ivy@home.com', 'pending', null, 49.99]
                               ];

                               const orderStmt = db.prepare(`INSERT INTO orders (vendor_id, customer_name, customer_email, status, tracking_number, total_amount) VALUES (?, ?, ?, ?, ?, ?)`);
                               orders.forEach(o => orderStmt.run(vendorId, ...o));
                               orderStmt.finalize();
                               console.log('Sample orders seeded');
                               resolve();
                           });
                } else {
                    console.log('Database already initialized');
                    resolve();
                }
            });
        });
    });
}

module.exports = { db, initDb };