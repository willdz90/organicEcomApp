import { Controller, Get, Query, Param, Post } from '@nestjs/common';
import { AliexpressService } from './aliexpress.service';

@Controller('aliexpress')
export class AliexpressController {
    constructor(private readonly aliexpressService: AliexpressService) { }

    @Get('products')
    async searchProducts(
        @Query('q') query?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('minRating') minRating?: string,
        @Query('category') categoryPath?: string,
        @Query('sortBy') sortBy?: 'orders' | 'rating' | 'newest' | 'price',
    ) {
        return this.aliexpressService.searchProducts(query || '', {
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            minRating: minRating ? parseFloat(minRating) : undefined,
            categoryPath,
            sortBy,
        });
    }

    @Get('products/:id')
    async getProduct(@Param('id') id: string) {
        return this.aliexpressService.getProduct(id);
    }

    @Post('seed-mock')
    async seedMock() {
        const count = await this.aliexpressService.createMockProducts();
        return {
            message: `Created ${count} mock AliExpress products`,
            count,
        };
    }
}
