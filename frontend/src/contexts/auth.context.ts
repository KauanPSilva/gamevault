import { createContext } from 'react';

import type {
  User,
  LoginInput,
  RegisterInput,
} from '../types/auth';

export interface AuthContextValue {
  user: User | null;

  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  login: (input: LoginInput) => Promise<void>;

  register: (input: RegisterInput) => Promise<void>;

  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );