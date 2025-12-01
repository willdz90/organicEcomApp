// src/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './types/jwt-payload.type';
import type { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new BadRequestException('Email already in use');

    const user = await this.users.create({ email, password, role: 'VIEWER' });
    const tokens = await this.generateTokens(user);
    return tokens;
    }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.generateTokens(user);
  }

    async generateTokens(user: User) {
    const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
    };

    // Access token: valor por defecto 15m
    const accessExpiresIn =
        (process.env.JWT_ACCESS_EXPIRES_IN as any) || '15m';

    // Refresh token: valor por defecto 7d
    const refreshExpiresIn =
        (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d';

    const accessToken = await this.jwt.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
        expiresIn: accessExpiresIn,
    } as any);

    const refreshToken = await this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
        expiresIn: refreshExpiresIn,
    } as any);

    return {
        accessToken,
        refreshToken,
        user: {
        id: user.id,
        email: user.email,
        role: user.role,
        },
    };
    }

    async generateTokensFromUserId(userId: string) {
        const user = await this.users.findById(userId);
        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }
        return this.generateTokens(user);
    }
}