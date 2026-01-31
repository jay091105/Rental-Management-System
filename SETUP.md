# Quick Setup Guide

## Prerequisites
- Node.js (v18 or higher) - [Download](https://nodejs.org/)
- MongoDB - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free)

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Configure Environment Variables

### Backend (.env file in `backend/` directory)
Create a file named `.env` with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rental-mgmt
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rental-mgmt
```

### Frontend (.env.local file in `frontend/` directory)
Create a file named `.env.local` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Step 3: Start MongoDB

### Local MongoDB
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### MongoDB Atlas
No setup needed - just use your connection string in `.env`

## Step 4: Run the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
You should see:
```
Connected to MongoDB
Server running on port 5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
You should see:
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

## Step 5: Access the Application

Open your browser and go to: **http://localhost:3000**

## First Steps

1. **Register as Vendor:**
   - Click "Register"
   - Select "Vendor" role
   - Fill in details including company logo and payment QR code data
   - Strong password required (8+ chars, uppercase, lowercase, number, special char)

2. **Register as Customer:**
   - Click "Register"
   - Select "Customer" role
   - Fill in details

3. **Login and Start:**
   - Login with your credentials
   - Vendors: Add products from the dashboard
   - Customers: Browse and rent products

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change `PORT` in backend `.env` to another port (e.g., 5001)
- Update `NEXT_PUBLIC_API_URL` in frontend `.env.local` accordingly

### Module Not Found Errors
- Run `npm install` again in both backend and frontend directories
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### Image Upload Issues
- Ensure `backend/uploads/` directory exists
- Check file permissions

## Features to Test

✅ Vendor Registration with Logo & QR Code
✅ Product Registration with Photos
✅ Customer Browsing with Filters
✅ Shopping Cart & Checkout
✅ Order Management
✅ Invoice Generation (PDF)
✅ Reports & Analytics
✅ Gantt Chart Schedule
✅ Order Tracking
✅ Chat/Messaging

## Need Help?

Check the main README.md for detailed documentation.
