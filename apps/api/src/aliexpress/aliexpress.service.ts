import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { AliexpressAuthService } from './aliexpress-auth.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { SearchProductsDto } from './dtos/search-products.dto';
import { ProductStatus } from '@prisma/client';
import type {
    AliexpressProduct,
    AliexpressSearchResponse,
    AliexpressProductDetail,
} from './interfaces/aliexpress-api.interface';

@Injectable()
export class AliexpressService {
    private readonly logger = new Logger(AliexpressService.name);
    private readonly appKey: string;
    private readonly appSecret: string;
    private readonly apiUrl: string;

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
        private readonly authService: AliexpressAuthService,
    ) {
        this.appKey = this.config.get<string>('ALIEXPRESS_APP_KEY')!;
        this.appSecret = this.config.get<string>('ALIEXPRESS_APP_SECRET')!;
        this.apiUrl = this.config.get<string>('ALIEXPRESS_API_URL')!;
    }

    /**
     * Search products on AliExpress
     */
    async searchProducts(query: SearchProductsDto, userId: string) {
        const accessToken = await this.authService.getValidToken(userId);

        const timestamp = Date.now().toString();
        const params: Record<string, string> = {
            method: 'aliexpress.ds.product.get',
            app_key: this.appKey,
            timestamp,
            sign_method: 'md5',
            format: 'json',
            v: '2.0',
            session: accessToken,
        };

        // Build search parameters
        if (query.keywords) {
            params.keywords = query.keywords;
        }
        if (query.categoryId) {
            params.category_id = query.categoryId;
        }
        if (query.minPrice) {
            params.min_price = query.minPrice.toString();
        }
        if (query.maxPrice) {
            params.max_price = query.maxPrice.toString();
        }
        if (query.sort) {
            params.sort = query.sort;
        }

        params.page_no = (query.page || 1).toString();
        params.page_size = (query.pageSize || 20).toString();

        const sign = this.generateSign(params);

        try {
            const response = await axios.get<AliexpressSearchResponse>(
                `${this.apiUrl}/rest`,
                {
                    params: { ...params, sign },
                },
            );

            if (response.data.aliexpress_ds_product_get_response?.result) {
                const result = response.data.aliexpress_ds_product_get_response.result;
                return {
                    products: result.products?.traffic_product_d_t_o || [],
                    total: result.total_record_count || 0,
                    page: query.page || 1,
                    pageSize: query.pageSize || 20,
                };
            }

            return {
                products: [],
                total: 0,
                page: query.page || 1,
                pageSize: query.pageSize || 20,
            };
        } catch (error) {
            this.logger.error('Failed to search products:', error);
            throw new Error('Failed to search products on AliExpress');
        }
    }

    /**
     * Get product details from AliExpress
     */
    async getProductDetails(productId: string, userId: string): Promise<AliexpressProductDetail> {
        const accessToken = await this.authService.getValidToken(userId);

        const timestamp = Date.now().toString();
        const params: Record<string, string> = {
            method: 'aliexpress.ds.product.get',
            app_key: this.appKey,
            timestamp,
            sign_method: 'md5',
            format: 'json',
            v: '2.0',
            session: accessToken,
            product_id: productId,
        };

        const sign = this.generateSign(params);

        try {
            const response = await axios.get(`${this.apiUrl}/rest`, {
                params: { ...params, sign },
            });

            if (response.data.error_response) {
                throw new Error(response.data.error_response.msg);
            }

            const result = response.data.aliexpress_ds_product_get_response?.result;
            if (!result) {
                throw new NotFoundException('Product not found');
            }

            return result;
        } catch (error) {
            this.logger.error(`Failed to get product details for ${productId}:`, error);
            throw new NotFoundException('Product not found on AliExpress');
        }
    }

    /**
     * Import product from AliExpress to local catalog
     */
    async importProduct(
        aliexpressProductId: string,
        userId: string,
        categoryId?: string,
    ) {
        // Get product details from AliExpress
        const aliProduct = await this.getProductDetails(aliexpressProductId, userId);

        // Check if already imported
        const existing = await this.prisma.aliexpressProduct.findUnique({
            where: { aliexpressProductId },
        });

        let aliexpressRecord;

        if (existing) {
            // Update existing record
            aliexpressRecord = await this.prisma.aliexpressProduct.update({
                where: { aliexpressProductId },
                data: {
                    title: aliProduct.product_title,
                    description: aliProduct.product_description,
                    images: aliProduct.original_image_urls || [aliProduct.product_main_image_url],
                    originalPrice: parseFloat(aliProduct.target_original_price || aliProduct.target_sale_price),
                    salePrice: parseFloat(aliProduct.target_sale_price),
                    currency: aliProduct.target_sale_price_currency || 'USD',
                    categoryPath: aliProduct.category_name,
                    rating: parseFloat(aliProduct.evaluate_rate || '0'),
                    orders: aliProduct.lastest_volume || 0,
                    aliexpressUrl: aliProduct.product_detail_url || `https://www.aliexpress.com/item/${aliexpressProductId}.html`,
                    lastSyncedAt: new Date(),
                },
            });
        } else {
            // Create new record
            aliexpressRecord = await this.prisma.aliexpressProduct.create({
                data: {
                    aliexpressProductId,
                    title: aliProduct.product_title,
                    description: aliProduct.product_description,
                    images: aliProduct.original_image_urls || [aliProduct.product_main_image_url],
                    originalPrice: parseFloat(aliProduct.target_original_price || aliProduct.target_sale_price),
                    salePrice: parseFloat(aliProduct.target_sale_price),
                    currency: aliProduct.target_sale_price_currency || 'USD',
                    categoryPath: aliProduct.category_name,
                    rating: parseFloat(aliProduct.evaluate_rate || '0'),
                    orders: aliProduct.lastest_volume || 0,
                    aliexpressUrl: aliProduct.product_detail_url || `https://www.aliexpress.com/item/${aliexpressProductId}.html`,
                    sellerName: aliProduct.shop_name,
                    sellerUrl: aliProduct.shop_url,
                },
            });
        }

        // Create Product in local catalog if not already linked
        if (!aliexpressRecord.importedProductId) {
            const salePrice = parseFloat(aliProduct.target_sale_price);
            const suggestedSellPrice = salePrice * 2.5; // 150% markup as suggestion

            const product = await this.prisma.product.create({
                data: {
                    title: aliProduct.product_title,
                    description: aliProduct.product_description,
                    categoryId: categoryId || null,
                    cost: salePrice,
                    sellPrice: suggestedSellPrice,
                    marginPct: 60, // (suggestedSellPrice - cost) / suggestedSellPrice * 100
                    images: {
                        urls: aliProduct.original_image_urls || [aliProduct.product_main_image_url],
                    },
                    supplierUrls: [
                        aliProduct.product_detail_url || `https://www.aliexpress.com/item/${aliexpressProductId}.html`,
                    ],
                    socialUrls: [],
                    status: ProductStatus.DRAFT,
                    ratingAvg: parseFloat(aliProduct.evaluate_rate || '0'),
                    createdById: userId,
                },
            });

            // Link AliExpress product to local product
            await this.prisma.aliexpressProduct.update({
                where: { id: aliexpressRecord.id },
                data: {
                    importedProductId: product.id,
                    importedAt: new Date(),
                },
            });

            return {
                aliexpressProduct: aliexpressRecord,
                product,
                message: 'Product imported successfully',
            };
        }

        return {
            aliexpressProduct: aliexpressRecord,
            product: await this.prisma.product.findUnique({
                where: { id: aliexpressRecord.importedProductId },
            }),
            message: 'Product already imported, data updated',
        };
    }

    /**
     * Sync product data from AliExpress
     */
    async syncProduct(aliexpressProductId: string, userId: string) {
        const aliProduct = await this.getProductDetails(aliexpressProductId, userId);

        const updated = await this.prisma.aliexpressProduct.update({
            where: { aliexpressProductId },
            data: {
                title: aliProduct.product_title,
                description: aliProduct.product_description,
                images: aliProduct.original_image_urls || [aliProduct.product_main_image_url],
                originalPrice: parseFloat(aliProduct.target_original_price || aliProduct.target_sale_price),
                salePrice: parseFloat(aliProduct.target_sale_price),
                rating: parseFloat(aliProduct.evaluate_rate || '0'),
                orders: aliProduct.lastest_volume || 0,
                lastSyncedAt: new Date(),
            },
        });

        return updated;
    }

    // ========== Private Methods ==========

    /**
     * Generate signature for API request
     */
    private generateSign(params: Record<string, string>): string {
        const sortedKeys = Object.keys(params).sort();

        let signString = this.appSecret;
        for (const key of sortedKeys) {
            signString += key + params[key];
        }
        signString += this.appSecret;

        return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
    }
}
