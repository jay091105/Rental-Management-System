import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';
import { generateQRCode } from '../utils/qrCode';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const register = async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, companyLogo, paymentQRCode, paymentData } = req.body;
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Invalid email format');
    }

    // Strong password validation: min 8 chars, at least one uppercase, one lowercase, one number, one special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new ApiError(400, 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(400, 'User already exists');

    let qrCodeUrl = paymentQRCode;
    // Generate QR code if payment data is provided but no QR code
    if (role === 'VENDOR' && paymentData && !paymentQRCode) {
      qrCodeUrl = await generateQRCode(paymentData);
    }

    // Handle file upload for company logo
    let logoUrl = companyLogo;
    if (req.file) {
      logoUrl = `/uploads/${req.file.filename}`;
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role,
      companyLogo: logoUrl,
      paymentQRCode: qrCodeUrl
    });
    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user: any = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};