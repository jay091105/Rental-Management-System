import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';
import { generateQRCode } from '../utils/qrCode';
import { MulterAuthRequest } from '../types/multer';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, brandName, colour, minPrice, maxPrice, search, duration } = req.query;
    const query: any = { availableUnits: { $gt: 0 } }; // Only show available products

    if (category) query.category = category;
    if (brandName) query.brandName = brandName;
    if (colour) query.colour = colour;

    // Price filtering based on duration
    if (minPrice || maxPrice) {
      const priceField = duration === 'HOUR' ? 'pricePerHour' : 
                        duration === 'MONTH' ? 'pricePerMonth' : 'pricePerDay';
      query[priceField] = {};
      if (minPrice) query[priceField].$gte = Number(minPrice);
      if (maxPrice) query[priceField].$lte = Number(maxPrice);
    } else {
      // Default to basePrice if no duration specified
      if (minPrice || maxPrice) {
        query.basePrice = {};
        if (minPrice) query.basePrice.$gte = Number(minPrice);
        if (maxPrice) query.basePrice.$lte = Number(maxPrice);
      }
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { brandName: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') }
      ];
    }

    const products = await Product.find(query).populate('owner', 'name email companyLogo paymentQRCode');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getVendorProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== 'VENDOR') {
      throw new ApiError(403, 'Only vendors can access this');
    }
    const products = await Product.find({ owner: req.user._id });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).populate('owner', 'name email companyLogo paymentQRCode');
    if (!product) throw new ApiError(404, 'Product not found');
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: MulterAuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== 'VENDOR') {
      throw new ApiError(403, 'Only vendors can create products');
    }
    
    const productData: any = {
      ...req.body,
      owner: req.user._id
    };

    // Handle file uploads (photos) - multer adds files to req
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : (req.files['photos'] || []);
      if (files.length > 0) {
        productData.photos = files.map((file: Express.Multer.File) => 
          `/uploads/${file.filename}`
        );
      }
    }

    // Set basePrice for filtering (use pricePerDay as default)
    if (!productData.basePrice) {
      productData.basePrice = productData.pricePerDay || productData.pricePerHour || productData.pricePerMonth || 0;
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: MulterAuthRequest, res: Response, next: NextFunction) => {
  try {
    const updateData: any = { ...req.body };
    
    // Handle file uploads (photos) if provided - multer adds files to req
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : (req.files['photos'] || []);
      if (files.length > 0) {
        updateData.photos = files.map((file: Express.Multer.File) => 
          `/uploads/${file.filename}`
        );
      }
    }
    
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updateData,
      { new: true }
    );
    if (!product) throw new ApiError(404, 'Product not found or unauthorized');
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!product) throw new ApiError(404, 'Product not found or unauthorized');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};