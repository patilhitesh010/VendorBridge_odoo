

Markdown
# VendorBridge - Vendor Portal

A clean, comprehensive, and scalable vendor management portal built with Node.js, Express, SQLite3, HTML5, and CSS3. 

VendorBridge streamlines the interaction between vendors and buyers by offering tools for product management, order tracking, RFQs (Request for Quotations), invoicing, and POS (Point of Sale) capabilities—all from an intuitive, centralized dashboard.

## 🚀 Features

* **Authentication & Profiles:** Secure registration, login, and profile management for vendors.
* **Product Management:** Complete CRUD capabilities to add, edit, track, and delete product listings.
* **Order & Buyer Management:** Track incoming orders, process approvals, and manage buyer interactions.
* **RFQs & Quotations:** Generate, send, and manage Requests for Quotations and pricing estimates.
* **Invoicing & Billing:** Streamlined invoice generation and tracking.
* **Point of Sale (POS):** Built-in POS system for direct sales and quick checkouts.
* **Analytics & Dashboard:** Real-time statistics, reporting logs, and business overview.
* **Responsive Design:** Fully functional across desktop, tablet, and mobile devices.

## 📂 Project Structure

While the architecture is simple, it covers a wide range of business operations:

```text
VendorBridge_odoo/
├── db/
│   └── init.js              # Database initialization and table schemas
├── routes/
│   ├── auth.js              # Authentication (login/register)
│   ├── dashboard.js         # Core dashboard statistics & metrics
│   ├── products.js          # Product operations
│   ├── orders.js            # Order processing and tracking
│   └── profile.js           # Vendor profiles
├── views/ & HTML pages      # Frontend UI
│   ├── login.html, register.html
│   ├── dashboard.html, home.html
│   ├── products.html, product.html
│   ├── orders.html, order-tracking.html, checkout.html
│   ├── rfqs.html, quotations.html, approvals.html
│   ├── invoice.html, pos.html, shop.html
│   └── reports.html, logs.html
├── js/ (Frontend scripts)
│   ├── app.js, init.js
│   ├── dashboard.js, analytics.js
│   ├── buyer.js, vendors.js
│   ├── invoices.js, pos.js, rfqs.js
│   └── ...
├── public/css/
│   └── style.css            # Global stylesheet
├── package.json             # App dependencies
└── server.js                # Main Express server entry point
🛠️ Installation
Clone the repository:

Bash
git clone [https://github.com/patilhitesh010/VendorBridge_odoo.git](https://github.com/patilhitesh010/VendorBridge_odoo.git)
cd VendorBridge_odoo
Install dependencies:
Make sure you have Node.js installed, then run:

Bash
npm install
Initialize the Database:
(The database file vendorbridge.db will be automatically generated via db/init.js when the server starts, creating required tables for vendors, products, orders, and items).

💻 Running the Server
Start the local development server with:

Bash
npm start
# or manually via node
node server.js
The application will be accessible at: http://localhost:3000

🌐 API Endpoints Overview
Authentication & Profile
POST /auth/register - Create a new vendor account

POST /auth/login - Authenticate a vendor

GET /auth/logout - Terminate session

GET /auth/vendor-info - Fetch current vendor session details

GET /profile & PUT /profile - Retrieve and update vendor profile data

Core Operations
Products: GET, POST, PUT, DELETE operations at /products

Orders: GET, POST, PUT (status updates) at /orders

Dashboard: GET /dashboard to retrieve summary statistics

🧰 Technologies Used
Backend Environment: Node.js, Express.js

Database: SQLite3 (Lightweight & zero-configuration)

Frontend: HTML5, CSS3, Vanilla JavaScript (DOM manipulation, Fetch API)

Security: bcrypt for password hashing, express-session for secure session management

🔒 Security Features
Passwords are never stored in plaintext (hashed using bcrypt).

Middleware-protected routes prevent unauthorized access to the dashboard and sub-pages.

Secure, server-side input validation and error handling.

Session-based state management rather than client-side vulnerability.

💡 Future Enhancements
Email & SMS Notifications: Automated alerts for order status changes and RFQ responses.

Payment Gateway Integration: Support for Stripe/PayPal inside the checkout and POS systems.

Inventory Alerts: Low-stock warnings via the dashboard analytics.

Export Functionality: Export reports and invoices to PDF/CSV.

Multi-Language Support (i18n): Globalizing the vendor portal.

📄 License
This project is licensed under the ISC License.

👥 Author
VendorBridge Development Team patilhitesh010
