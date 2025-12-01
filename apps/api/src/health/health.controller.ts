import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async ok() {
    // ping rápido a la DB
    await this.prisma.$queryRaw`SELECT 1+1`;
    return { status: 'ok' };
  }

  @Get('live')
  live() {
    return { status: 'live' };
  }

  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ready' };
  }
}
