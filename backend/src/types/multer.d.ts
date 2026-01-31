import { AuthRequest } from '../middleware/auth';

export interface MulterAuthRequest extends AuthRequest {
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}
