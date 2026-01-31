import { Request, Response, NextFunction } from 'express';
import { Property } from '../models/Property';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';

export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { minPrice, maxPrice, location, availability } = req.query;
    const query: any = {};

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (location) query.location = new RegExp(location as string, 'i');
    if (availability !== undefined) query.availability = availability === 'true';

    const properties = await Property.find(query).populate('owner', 'name email');
    res.json(properties);
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email');
    if (!property) throw new ApiError(404, 'Property not found');
    res.json(property);
  } catch (error) {
    next(error);
  }
};

export const createProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const property = await Property.create({ ...req.body, owner: req.user._id });
    res.status(201).json(property);
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!property) throw new ApiError(404, 'Property not found or unauthorized');
    res.json(property);
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!property) throw new ApiError(404, 'Property not found or unauthorized');
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};