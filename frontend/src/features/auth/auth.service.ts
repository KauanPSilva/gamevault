import { api } from '../../services/api';

import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  ProfileResponse,
} from '../../types/auth';

export const authService = {
  async register(
    input: RegisterInput,
  ): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      '/auth/register',
      input,
    );

    return data;
  },

  async login(
    input: LoginInput,
  ): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      '/auth/login',
      input,
    );

    return data;
  },

  async getProfile(
    signal?: AbortSignal,
  ): Promise<ProfileResponse> {
    const { data } = await api.get<ProfileResponse>(
      '/auth/me',
      { signal },
    );

    return data;
  },
};