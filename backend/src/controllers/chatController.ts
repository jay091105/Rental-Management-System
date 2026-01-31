import { Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../utils/apiError';

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const messages = await Message.find({ booking: bookingId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name');
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId, receiverId, content } = req.body;
    const message = await Message.create({
      booking: bookingId,
      sender: req.user._id,
      receiver: receiverId,
      content
    });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};
