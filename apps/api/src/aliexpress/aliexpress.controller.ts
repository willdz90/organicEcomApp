import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
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

    // Temporary endpoint for OAuth testing
    @Get('callback')
    async handleCallback(
        @Query('code') code?: string,
        @Query('state') state?: string,
        @Query('error') error?: string,
    ) {
        if (error) {
            return {
                success: false,
                error: error,
                message: 'OAuth authorization failed'
            };
        }

        if (!code) {
            return {
                success: false,
                message: 'No authorization code received'
            };
        }

        return {
            success: true,
            code: code,
            state: state,
            message: '✅ Authorization code received! Copy this code and use it in Postman to get your access token.',
            nextStep: 'Use this code in Postman: POST http://localhost:4000/api/aliexpress/exchange-token'
        };
    }


    // Exchange authorization code for access token (Production endpoint)
    @Post('exchange-token')
    async exchangeToken(@Body() body: { code: string }) {
        return this.aliexpressService.exchangeCodeForToken(body.code);
    }
}
