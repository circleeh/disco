import { Request, Response, NextFunction } from 'express';
import { User } from '../types';
interface AuthenticatedRequest extends Request {
    user?: User;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=auth.d.ts.map