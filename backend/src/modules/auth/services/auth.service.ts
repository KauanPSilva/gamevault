import { AppError } from '../../../errors/app.error.js';

import {
  UserRepository,
} from '../../users/repositories/user.repository.js';

import {
  hashPassword,
  verifyPassword,
} from '../../../utils/password.js';

import {
  generateToken,
} from '../../../utils/jwt.js';

import type {
  RegisterInput,
} from '../schemas/register.schema.js';

import type {
  LoginInput,
} from '../schemas/login.schema.js';

export class AuthService {
  constructor(
    private readonly userRepository = new UserRepository()
  ) {}

  async register(input: RegisterInput) {
    const existingUser =
      await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError(
        'Email already registered',
        409,
        'EMAIL_ALREADY_REGISTERED'
      );
    }

    const passwordHash = await hashPassword(
      input.password
    );

    try {
      const user = await this.userRepository.create({
        name: input.name,
        email: input.email,
        passwordHash,
      });

      return {
        user,
        accessToken: generateToken(user),
        tokenType: 'Bearer',
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new AppError(
          'Email already registered',
          409,
          'EMAIL_ALREADY_REGISTERED'
        );
      }

      throw error;
    }
  }

  async login(input: LoginInput) {
    const user =
      await this.userRepository.findByEmailWithPassword(
        input.email
      );

    if (!user) {
      // Perform an equivalent expensive operation to
      // reduce timing differences for unknown accounts.
      await hashPassword(input.password);

      throw new AppError(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const validPassword = await verifyPassword(
      input.password,
      user.passwordHash
    );

    if (!validPassword) {
      throw new AppError(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: publicUser,
      accessToken: generateToken(publicUser),
      tokenType: 'Bearer',
    };
  }

  async getProfile(userId: string) {
    const user =
      await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError(
        'User not found',
        404,
        'USER_NOT_FOUND'
      );
    }

    return user;
  }
}