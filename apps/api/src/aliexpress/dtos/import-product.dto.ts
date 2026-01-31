import { IsString, IsOptional } from 'class-validator';

export class ImportProductDto {
    @IsString()
    aliexpressProductId!: string;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
