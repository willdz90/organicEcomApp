// src/products/products.service.ts
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ProductStatus,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

export type FindProductsQuery = {
  q?: string;
  countryGroup?: string; // 👈 ahora es string libre
  status?: ProductStatus;
  limit?: string;
  cursor?: string;
  sort?: 'new' | 'price_asc' | 'price_desc';
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(q: FindProductsQuery) {
    const take = Math.min(
      Math.max(parseInt(q.limit ?? '20', 10) || 20, 1),
      100,
    );

    const where: Prisma.ProductWhereInput = {};

    // 🔍 Filtro por texto
    if (q.q) {
      where.title = { contains: q.q, mode: 'insensitive' };
    }

    // 🌍 Filtro por región (countryGroups: string[])
    if (q.countryGroup) {
      where.countryGroups = { has: q.countryGroup };
    }

    // 🟢 Filtro por estado (si viene)
    if (q.status) {
      where.status = q.status;
    }

    // 🗂 Orden
    let orderBy: Prisma.ProductOrderByWithRelationInput = {
      createdAt: 'desc',
    };
    if (q.sort === 'price_asc') orderBy = { sellPrice: 'asc' };
    if (q.sort === 'price_desc') orderBy = { sellPrice: 'desc' };

    const cursor = q.cursor ? { id: q.cursor } : undefined;

    const items = await this.prisma.product.findMany({
      where,
      orderBy,
      take,
      ...(cursor ? { skip: 1, cursor } : {}),
      select: {
        id: true,
        title: true,
        images: true,
        sellPrice: true,
        cost: true,
        marginPct: true,
        countryGroups: true,
        status: true,
        ratingAvg: true,
        // 🔹 Para mostrar categoría en el marketplace
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        // 🔹 Para proveedor / contenido
        supplierUrls: true,
        socialUrls: true,

        createdAt: true,
      },
    });

    const nextCursor =
      items.length === take ? items[items.length - 1].id : null;

    return {
      data: items,
      meta: { nextCursor, take },
    };
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        analyses: { orderBy: { createdAt: 'desc' }, take: 1 },
        mediaLinks: true,
      },
    });
  }

  /**
   * Crear producto con auditoría:
   * - createdById = userId
   * - si se crea en PUBLISHED → publishedAt + publishedById = userId
   */
  async create(dto: CreateProductDto, userId?: string | null) {
    let marginPct: number | undefined = undefined;

    if (
      typeof dto.cost === 'number' &&
      typeof dto.sellPrice === 'number' &&
      dto.sellPrice > 0
    ) {
      marginPct = Number(
        (((dto.sellPrice - dto.cost) / dto.sellPrice) * 100).toFixed(2),
      );
    }

    const isPublishedOnCreate = dto.status === ProductStatus.PUBLISHED;

    const created = await this.prisma.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId ?? null,
        countryGroups: dto.countryGroups,
        cost: dto.cost,
        sellPrice: dto.sellPrice,
        marginPct,
        images: dto.images,
        supplierUrls: dto.supplierUrls,
        socialUrls: dto.socialUrls,
        whyGood: dto.whyGood,
        filmingApproach: dto.filmingApproach,
        marketingAngles: dto.marketingAngles,
        status: dto.status,
        ratingAvg: dto.ratingAvg ?? 0,
        ratingCount: 0,
        publishedAt: isPublishedOnCreate ? new Date() : null,
        createdById: userId ?? undefined,
        publishedById: isPublishedOnCreate ? userId ?? null : null,
      } as any,
      select: {
        id: true,
        title: true,
        countryGroups: true,
        sellPrice: true,
        cost: true,
        marginPct: true,
        status: true,
        ratingAvg: true,
        createdAt: true,
      },
    });

    return { data: created };
  }

  /**
   * Actualizar producto con auditoría:
   * - updatedById = userId
   * - si status pasa a PUBLISHED → publishedAt = ahora, publishedById = userId
   * - si status pasa a DRAFT o ARCHIVED → publishedAt / publishedById = null
   */
  async update(
    id: string,
    dto: UpdateProductDto,
    userId?: string | null,
  ) {
    let marginPct: number | undefined = undefined;

    if (
      typeof dto.cost === 'number' &&
      typeof dto.sellPrice === 'number' &&
      dto.sellPrice > 0
    ) {
      marginPct = Number(
        (((dto.sellPrice - dto.cost) / dto.sellPrice) * 100).toFixed(2),
      );
    }

    let publishedAtUpdate: Date | null | undefined = undefined;
    let publishedByIdUpdate: string | null | undefined = undefined;

    if (dto.status === ProductStatus.PUBLISHED) {
      publishedAtUpdate = new Date();
      publishedByIdUpdate = userId ?? null;
    } else if (
      dto.status === ProductStatus.DRAFT ||
      dto.status === ProductStatus.ARCHIVED
    ) {
      publishedAtUpdate = null;
      publishedByIdUpdate = null;
    }

    const data: any = {
      ...dto,
      ...(marginPct !== undefined ? { marginPct } : {}),
      ...(userId ? { updatedById: userId } : {}),
    };

    if (publishedAtUpdate !== undefined) {
      data.publishedAt = publishedAtUpdate;
    }
    if (publishedByIdUpdate !== undefined) {
      data.publishedById = publishedByIdUpdate;
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data,
    });

    return { data: updated };
  }

  async remove(id: string) {
    const deleted = await this.prisma.product.delete({
      where: { id },
    });
    return { data: deleted };
  }
}
