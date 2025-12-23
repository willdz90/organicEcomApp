// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

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
        role: (data.role as any) ?? 'VIEWER',
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
        isActive: true, // 🔹 Faltaba este campo
        name: true,
        country: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🔹 Mi perfil
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        plan: true,
        isActive: true,
        name: true,
        country: true,
        timezone: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // 🔹 Actualizar mi perfil
  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        country: dto.country,
        timezone: dto.timezone,
      },
      select: {
        id: true,
        email: true,
        role: true,
        plan: true,
        isActive: true,
        name: true,
        country: true,
        timezone: true,
        createdAt: true,
      },
    });

    return user;
  }

  // 🔹 Cambiar contraseña
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }

  // 🔹 Actualizar rol (ADMIN only) - Mantenemos por compatibilidad si se usa aislado, pero el adminUpdate general lo cubre
  async updateRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, email: true, role: true },
    });
  }

  // 🔹 Actualización COMPLETA por Admin (Plan, Status, Rol, etc.)
  async adminUpdateUser(userId: string, data: {
    role?: string;
    plan?: string;
    isActive?: boolean;
    name?: string;
    country?: string;
    timezone?: string;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: data.role as any,
        plan: data.plan as any,
        isActive: data.isActive,
        name: data.name,
        country: data.country,
        timezone: data.timezone,
      },
    });
  }

  // 🔹 Invitar Usuario
  async inviteUser(email: string) {
    // 1. Verificar si ya existe
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('User already exists');

    // 2. Crear usuario temporal y "simular" envío de correo
    // Generamos password random
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'VIEWER',
        plan: 'FREE',
        isActive: true, // O false si queremos que active por mail
      },
    });

    // 3. Log user invitation (Simulación de servicio de correo)
    console.log(`
      [MOCK EMAIL SERVICE]
      To: ${email}
      Subject: Welcome to OrganicEcom!
      Body: You have been invited. Your temporal password is: ${tempPassword}
      Login at: http://localhost:5173/login
    `);

    return { message: 'Invitation sent', tempPassword }; // Devolvemos tempPass para facilitar pruebas locales
  }
}

