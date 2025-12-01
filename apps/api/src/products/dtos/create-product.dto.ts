// src/products/dtos/create-product.dto.ts
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ArrayMinSize,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  // 🔹 Categoría dinámica (relación con Category.id, puede ser null)
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  // 🔹 Múltiples grupos de país DINÁMICOS (string[])
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  countryGroups!: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellPrice!: number;

  // 🔹 Proveedores (mínimo 1) — string relajado
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  supplierUrls!: string[];

  // 🔹 Redes / contenido (mínimo 1)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  socialUrls!: string[];

  // 🔹 Imágenes (mínimo 1)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images!: string[];

  // Copy / marketing
  @IsString()
  whyGood!: string;

  @IsString()
  filmingApproach!: string;

  @IsString()
  marketingAngles!: string;

  @IsEnum(ProductStatus)
  status!: ProductStatus;

  // ⭐ Rating inicial (0–5) opcional
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ratingAvg?: number;

  // Opcional para guardar cosas como categoryLabel, flags, etc.
  @IsOptional()
  metrics?: any;
}
