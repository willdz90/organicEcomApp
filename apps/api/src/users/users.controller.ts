// src/users/users.controller.ts
import {
  Controller,
  Get,
  Param,
  UseGuards,
  Patch,
  Body,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // 🔹 Listado de usuarios
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR, Role.IT_SUPPORT)
  @Get()
  async list() {
    return this.usersService.getAll();
  }

  // 🔹 Detalle por id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR, Role.IT_SUPPORT)
  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // 🔹 Info del usuario logueado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@GetUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  // 🔹 Actualizar perfil del usuario logueado
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @GetUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMe(userId, dto);
  }

  @Post('change-password')
  async changePassword(
    @GetUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  // 🔹 Cambiar rol (Legacy/Specific)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.usersService.updateRole(id, role);
  }

  // 🔹 Actualización ADMIN COMPLETA (Plan, Status, etc.)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async adminUpdateUser(
    @Param('id') id: string,
    @Body() body: any, // Idealmente usar DTO específico
  ) {
    return this.usersService.adminUpdateUser(id, body);
  }

  // 🔹 Invitar Usuario
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('invite')
  async invite(@Body('email') email: string) {
    return this.usersService.inviteUser(email);
  }
}
