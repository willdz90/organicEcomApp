// src/products/products.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  UseGuards,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductsService } from './products.service';
import type { FindProductsQuery } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ProductStatus } from '@prisma/client';
import { UpdateProductDto } from './dtos/update-product.dto'; // ⬅️ AÑADE ESTO


@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // 🟢 Endpoint para el Marketplace (REQUIERE login)
  // - Cualquier rol autenticado puede verlo (incluye VIEWER)
  // - Siempre devuelve SOLO productos publicados
  @Get('marketplace')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DATA_ENTRY, Role.ANALYST, Role.VIEWER)
  listMarketplace(@Query() query: FindProductsQuery) {
    const merged: FindProductsQuery = {
      ...query,
      status: ProductStatus.PUBLISHED,
    };
    return this.service.findMany(merged);
  }

  // 🔵 Listar productos internos (panel)
  // Solo roles "operativos" (no VIEWER)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DATA_ENTRY, Role.ANALYST)
  list(@Query() query: FindProductsQuery) {
    return this.service.findMany(query);
  }

  // 🔵 Detalle interno de un producto
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DATA_ENTRY, Role.ANALYST)
  detail(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // 🟣 Crear producto — ADMIN / DATA_ENTRY
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DATA_ENTRY)
  create(@Body() dto: CreateProductDto, @Req() req: Request) {
    const user = req.user as any;
    const userId = user?.id ?? user?.sub ?? null;
    return this.service.create(dto, userId);
  }

  // 🟣 Actualizar producto — ADMIN / DATA_ENTRY / ANALYST
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DATA_ENTRY, Role.ANALYST)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const userId = user?.id ?? user?.sub ?? null;
    return this.service.update(id, dto, userId);
  }


  // 🔴 Eliminar producto — solo ADMIN
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
