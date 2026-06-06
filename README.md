# VendorBridge - Vendor Portal

A clean and simple vendor management portal built with Node.js, Express, SQLite3, HTML5, and CSS3.

## Features

- **Vendor Authentication**: Register and login for vendors
- **Product Management**: Add, edit, and delete products
- **Order Management**: View and manage orders
- **Dashboard**: Real-time statistics and overview
- **Profile Management**: Update vendor information
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
VendorBridge_odoo/
├── db/
│   └── init.js           # Database initialization and schema
├── routes/
│   ├── auth.js           # Authentication routes (login, register)
│   ├── dashboard.js      # Dashboard statistics
│   ├── products.js       # Product CRUD operations
│   ├── orders.js         # Order management
│   └── profile.js        # Vendor profile management
├── views/
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── dashboard.html    # Dashboard page
│   ├── products.html     # Products management page
│   ├── orders.html       # Orders page
│   └── profile.html      # Profile page
├── public/
│   └── css/
│       └── style.css     # Global stylesheet
├── package.json          # Project dependencies
└── server.js             # Main server file
```

## Installation

1. Navigate to the project directory:
```bash
cd VendorBridge_odoo
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

Start the server with:
```bash
node server.js
```

The server will be available at `http://localhost:3000`

## Usage

1. **Register**: Visit `http://localhost:3000/register` to create a new vendor account
2. **Login**: Visit `http://localhost:3000/login` to login with your credentials
3. **Dashboard**: View your statistics and overview
4. **Products**: Add and manage your products
5. **Orders**: View and manage incoming orders
6. **Profile**: Update your vendor information

## Database

The application uses SQLite3 with the following tables:

- **vendors**: Stores vendor account information
- **products**: Stores vendor products
- **orders**: Stores customer orders
- **order_items**: Stores individual items in each order

Database file is automatically created at `db/vendorbridge.db`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new vendor
- `POST /auth/login` - Login vendor
- `GET /auth/logout` - Logout vendor
- `GET /auth/vendor-info` - Get vendor information

### Products
- `GET /products` - Get all vendor products
- `GET /products/:id` - Get single product
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Orders
- `GET /orders` - Get all vendor orders
- `GET /orders/:id` - Get single order details
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status

### Profile
- `GET /profile` - Get vendor profile
- `PUT /profile` - Update vendor profile

### Dashboard
- `GET /dashboard` - Get dashboard statistics

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: bcrypt for password hashing
- **Session Management**: express-session

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Protected routes with middleware
- Input validation on server-side

## Future Enhancements

- Email notifications
- Advanced reporting
- Payment integration
- Customer management
- Inventory analytics
- Multi-language support

## License

ISC

## Author

VendorBridge Development Team
