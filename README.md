# Rental Management System

A comprehensive rental management system with vendor and customer portals, featuring product registration, cart/checkout, order tracking, reports, and more.

## Features

### Vendor Features
- ✅ Secure registration with email validation and strong password requirements
- ✅ Company logo and QR code registration for payments
- ✅ Product registration with photos, pricing (per hour/day/month), deposits, penalties, and delivery charges
- ✅ Order management with status updates (shipped, out for delivery, delivered)
- ✅ Return processing with damage assessment and deposit handling
- ✅ Monthly/weekly reports with pie charts and daily statistics
- ✅ Gantt chart for product schedules
- ✅ Invoice generation (PDF) with company logos
- ✅ Chat/messaging with customers

### Customer Features
- ✅ Secure login with email validation and strong password
- ✅ Product browsing with search and filters (category, brand, color, price range, duration)
- ✅ Shopping cart with vendor-wise payment options (QR code/COD)
- ✅ Order tracking with real-time status updates
- ✅ Order cancellation (1-hour window, penalty after)
- ✅ Invoice download (PDF)
- ✅ Chat/messaging with vendors

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- PDFKit for invoice generation
- QRCode for payment QR generation

### Frontend
- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- React Hot Toast for notifications
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rental-mgmt
JWT_SECRET=your-secret-key-here
```

4. Create uploads directory:
```bash
mkdir uploads
```

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
Rental-Management-System/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, error handling, uploads
│   │   ├── utils/          # Utilities (QR code, errors)
│   │   ├── app.ts          # Express app configuration
│   │   └── server.ts       # Server entry point
│   └── uploads/            # Uploaded files (images)
├── frontend/
│   ├── app/                # Next.js app router pages
│   │   ├── vendor/         # Vendor pages
│   │   ├── orders/         # Order management
│   │   └── products/       # Product pages
│   ├── components/         # React components
│   ├── context/            # React context (Auth)
│   ├── services/          # API service
│   └── types/             # TypeScript types
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/vendor` - Get vendor's products
- `POST /api/products` - Create product (vendor only)
- `PUT /api/products/:id` - Update product (vendor only)
- `DELETE /api/products/:id` - Delete product (vendor only)

### Orders
- `POST /api/orders` - Create order from cart
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/vendor-orders` - Get vendor's orders
- `GET /api/orders/:id` - Get order by ID

### Bookings
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/vendor-bookings` - Get vendor's bookings
- `GET /api/bookings/gantt` - Get Gantt chart data
- `GET /api/bookings/reports` - Get reports data
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/return` - Process return
- `GET /api/bookings/:id/invoice` - Download invoice (PDF)

### Chat
- `GET /api/chat/:bookingId` - Get messages
- `POST /api/chat` - Send message

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## Key Features Implementation

### Password Security
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Email Validation
- Standard email format validation

### Order Cancellation
- Free cancellation within 1 hour
- ₹1 per minute penalty after 1 hour

### Return Management
- Automatic late penalty calculation based on rental duration
- Damage assessment with charge deduction from deposit
- Deposit refund if no damage

### Reports
- Pie chart for category distribution
- Bar chart for daily orders and revenue
- Date range and week filters

### Gantt Chart
- Visual representation of product schedules
- Color-coded by status
- Click to view booking details

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Notes

- Image uploads are stored in `backend/uploads/`
- QR codes are generated using the `qrcode` library
- Invoices are generated using PDFKit
- All dates are handled in ISO format
- The system automatically reduces available units when orders are placed

## Future Enhancements

- Real-time notifications using WebSockets
- Email notifications
- Payment gateway integration
- Advanced analytics dashboard
- Mobile app support
- Multi-language support

## License

This project is open source and available for educational purposes.
