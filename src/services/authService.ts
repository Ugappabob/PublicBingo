import { app } from '../firebase/index';
import { getAuth, User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { AuthError } from "../types/errors";
import { AdminUser } from "../types/auth";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';

export class AuthService {
  private auth;

  constructor() {
    this.auth = getAuth(app);
  }

  private async checkAdminStatus(user: User): Promise<AdminUser> {
    const token = await user.getIdTokenResult();
    return {
      ...user,
      isAdmin: token.claims.admin === true || token.signInProvider === 'google-service-account'
    } as AdminUser;
  }

  async login(email: string, password: string): Promise<AdminUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return this.checkAdminStatus(userCredential.user);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        throw new AuthError('Failed to login: ' + error.message, 'UNAUTHORIZED', true);
      }
      throw new AuthError('Failed to login: Unknown error', 'UNAUTHORIZED', true);
    }
  }

  async register(email: string, password: string, displayName: string): Promise<AdminUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      return this.checkAdminStatus(userCredential.user);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        throw new AuthError('Failed to register: ' + error.message, 'UNAUTHORIZED', true);
      }
      throw new AuthError('Failed to register: Unknown error', 'UNAUTHORIZED', true);
    }
  }

  async signInAsGuest(): Promise<AdminUser> {
    try {
      const userCredential = await signInAnonymously(this.auth);
      return this.checkAdminStatus(userCredential.user);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        throw new AuthError('Failed to sign in as guest: ' + error.message, 'UNAUTHORIZED', true);
      }
      throw new AuthError('Failed to sign in as guest: Unknown error', 'UNAUTHORIZED', true);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        throw new AuthError('Failed to logout: ' + error.message, 'UNAUTHORIZED', true);
      }
      throw new AuthError('Failed to logout: Unknown error', 'UNAUTHORIZED', true);
    }
  }

  getCurrentUser(): AdminUser | null {
    const user = this.auth.currentUser;
    return user ? { ...user, isAdmin: false } as AdminUser : null;
  }

  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  isGuest(): boolean {
    return this.auth.currentUser?.isAnonymous ?? false;
  }

  async isAdmin(): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;
    const adminUser = await this.checkAdminStatus(user);
    return adminUser.isAdmin ?? false;
  }
} 