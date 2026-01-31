import { IsString, IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductsDto {
    @IsString()
    @IsOptional()
    keywords?: string;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    pageSize?: number = 20;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsString()
    @IsOptional()
    @IsIn(['price_asc', 'price_desc', 'orders_desc', 'rating_desc'])
    sort?: 'price_asc' | 'price_desc' | 'orders_desc' | 'rating_desc';

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    minPrice?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    maxPrice?: number;
}
