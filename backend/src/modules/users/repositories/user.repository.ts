import { prisma } from '../../../config/database.js';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UserRepository {
  async create(input: CreateUserInput) {
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        role: 'CUSTOMER',
      },
      select: publicUserSelect,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: publicUserSelect,
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  async findByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        ...publicUserSelect,
        passwordHash: true,
      },
    });
  }
}