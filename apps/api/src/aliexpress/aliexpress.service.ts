
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AliexpressApiClient } from './aliexpress-api.client';
import * as crypto from 'crypto';

@Injectable()
export class AliexpressService {
    constructor(
        private prisma: PrismaService,
        private apiClient: AliexpressApiClient,
    ) { }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(code: string) {
        try {
            const tokenData = await this.apiClient.getAccessToken(code);

            // TODO: Save token to database when AliexpressToken model is created
            // await this.saveToken(tokenData);

            return {
                success: true,
                data: tokenData,
                message: 'Access token obtained successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to exchange code for token'
            };
        }
    }

    /**
     * Generate signature for AliExpress API requests
     * Used for OAuth token exchange and API calls
     */
    generateSignature(params: Record<string, any>, appSecret: string): string {
        // Sort parameters alphabetically
        const sortedKeys = Object.keys(params).sort();

        // Concatenate: appSecret + key1value1 + key2value2 + ... + appSecret
        let signString = appSecret;
        sortedKeys.forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                signString += key + params[key];
            }
        });
        signString += appSecret;

        // Calculate HMAC-SHA256 and convert to uppercase hex
        return crypto
            .createHmac('sha256', appSecret)
            .update(signString, 'utf8')
            .digest('hex')
            .toUpperCase();
    }

    /**
     * Prepare signed parameters for OAuth token request
     */
    prepareTokenRequestParams(code: string, timestamp?: string) {
        // Use provided timestamp or generate current time in milliseconds
        const ts = timestamp || Date.now().toString();
        const appKey = '525634';
        const appSecret = '1RM7SSSS5FKeDV7qJqxc3Y6HGeE8Kr1b';

        const params = {
            code,
            app_key: appKey,
            timestamp: ts,
            sign_method: 'sha256',
            format: 'json',
        };

        const sign = this.generateSignature(params, appSecret);

        return {
            ...params,
            app_secret: appSecret,
            sign,
        };
    }

    async searchProducts(query: string, filters?: {
        minPrice?: number;
        maxPrice?: number;
        minRating?: number;
        categoryPath?: string;
        sortBy?: 'orders' | 'rating' | 'newest' | 'price';
    }) {
        const where: Prisma.AliexpressProductWhereInput = {
            isAvailable: true,
            AND: [
                query ? {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ]
                } : {},
                filters?.minPrice ? { originalPrice: { gte: filters.minPrice } } : {},
                filters?.maxPrice ? { originalPrice: { lte: filters.maxPrice } } : {},
                filters?.minRating ? { rating: { gte: filters.minRating } } : {},
                filters?.categoryPath ? { categoryPath: { contains: filters.categoryPath } } : {},
            ]
        };

        const orderBy: Prisma.AliexpressProductOrderByWithRelationInput =
            filters?.sortBy === 'orders' ? { orders: 'desc' } :
                filters?.sortBy === 'rating' ? { rating: 'desc' } :
                    filters?.sortBy === 'newest' ? { firstImportedAt: 'desc' } :
                        filters?.sortBy === 'price' ? { originalPrice: 'asc' } :
                            { orders: 'desc' }; // default

        return this.prisma.aliexpressProduct.findMany({
            where,
            orderBy,
            take: 50,
        });
    }

    async getProduct(id: string) {
        return this.prisma.aliexpressProduct.findUnique({
            where: { id },
            include: {
                importedProduct: true,
            }
        });
    }

    async createMockProducts() {
        // Create some mock products for testing
        const mockProducts = [
            {
                aliexpressProductId: 'mock-1',
                aliexpressUrl: 'https://aliexpress.com/item/mock-1',
                title: 'Smart Watch Fitness Tracker',
                description: 'Waterproof smartwatch with heart rate monitor, sleep tracking, and 7-day battery life.',
                images: ['https://via.placeholder.com/400x400?text=Smart+Watch'],
                originalPrice: 29.99,
                salePrice: 24.99,
                categoryPath: 'Electronics > Wearables > Smart Watches',
                brand: 'TechGear',
                orders: 15420,
                rating: 4.7,
                reviewCount: 3240,
                freeShipping: true,
            },
            {
                aliexpressProductId: 'mock-2',
                aliexpressUrl: 'https://aliexpress.com/item/mock-2',
                title: 'Wireless Bluetooth Earbuds',
                description: 'True wireless earbuds with noise cancellation and 24h battery life with charging case.',
                images: ['https://via.placeholder.com/400x400?text=Earbuds'],
                originalPrice: 45.00,
                salePrice: 35.99,
                categoryPath: 'Electronics > Audio > Earphones',
                brand: 'SoundPro',
                orders: 28500,
                rating: 4.8,
                reviewCount: 5680,
                freeShipping: true,
            },
            {
                aliexpressProductId: 'mock-3',
                aliexpressUrl: 'https://aliexpress.com/item/mock-3',
                title: 'LED Desk Lamp with USB Charging',
                description: 'Adjustable LED desk lamp with touch control, 3 color modes, and built-in USB port.',
                images: ['https://via.placeholder.com/400x400?text=Desk+Lamp'],
                originalPrice: 19.99,
                categoryPath: 'Home & Garden > Lighting > Desk Lamps',
                brand: 'LightHome',
                orders: 8900,
                rating: 4.5,
                reviewCount: 1240,
                freeShipping: false,
            },
        ];

        for (const product of mockProducts) {
            await this.prisma.aliexpressProduct.upsert({
                where: { aliexpressProductId: product.aliexpressProductId },
                update: product,
                create: product,
            });
        }

        return mockProducts.length;
    }
}
