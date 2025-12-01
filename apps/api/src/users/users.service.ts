// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

    async create(data: {
    email: string;
    password: string;
    role?: string;
    plan?: string;
    }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
        data: {
        email: data.email,
        password: hashedPassword,
        role: (data.role as any) ?? 'VIEWER', // default seguro
        plan: (data.plan as any) ?? 'FREE',
        },
    });
    }

  async getAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
