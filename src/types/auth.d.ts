import { User } from 'firebase/auth';

export interface AdminUser extends User {
  isAdmin?: boolean;
}

// This file is here to satisfy TypeScript module resolution.
export function signIn(email: string, password: string): Promise<void>;
export function signUp(email: string, password: string): Promise<void>;
export function signInAsGuest(): Promise<void>; 