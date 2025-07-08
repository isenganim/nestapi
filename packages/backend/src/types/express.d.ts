import { UserRole, UserStatus } from '../generated/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  isLocked: boolean;
  failedLoginAttempts: number;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}