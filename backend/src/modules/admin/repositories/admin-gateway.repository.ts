import { prisma } from '../../../config/database.js';

const adminGatewaySelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class AdminGatewayRepository {
  async findAll() {
    return prisma.paymentGateway.findMany({
      select: adminGatewaySelect,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string) {
    return prisma.paymentGateway.findUnique({
      where: {
        id,
      },
      select: adminGatewaySelect,
    });
  }

  async updateStatus(id: string, isActive: boolean) {
    return prisma.paymentGateway.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
      select: adminGatewaySelect,
    });
  }
}