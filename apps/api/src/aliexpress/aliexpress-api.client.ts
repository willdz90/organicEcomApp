import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class AliexpressApiClient {
    private readonly appKey: string;
    private readonly appSecret: string;
    private readonly apiUrl: string;
    private readonly callbackUrl: string;
    private readonly httpClient: AxiosInstance;

    constructor(private configService: ConfigService) {
        this.appKey = this.configService.get<string>('ALIEXPRESS_APP_KEY') || '';
        this.appSecret = this.configService.get<string>('ALIEXPRESS_APP_SECRET') || '';
        this.apiUrl = this.configService.get<string>('ALIEXPRESS_API_URL') || 'https://api-sg.aliexpress.com';
        this.callbackUrl = this.configService.get<string>('ALIEXPRESS_CALLBACK_URL') || '';

        if (!this.appKey || !this.appSecret) {
            console.warn('AliExpress API credentials not configured');
        }

        this.httpClient = axios.create({
            baseURL: this.apiUrl,
            timeout: 30000,
        });
    }

    /**
     * Generate OAuth authorization URL
     */
    getAuthorizationUrl(state?: string): string {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.appKey,
            redirect_uri: this.callbackUrl,
            state: state || this.generateState(),
            view: 'web',
        });

        return `${this.apiUrl}/oauth/authorize?${params.toString()}`;
    }

    /**
     * Exchange authorization code for access token
     */
    async getAccessToken(code: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }> {
        const params = {
            grant_type: 'authorization_code',
            code,
            client_id: this.appKey,
            client_secret: this.appSecret,
            redirect_uri: this.callbackUrl,
        };

        const response = await this.httpClient.post('/oauth/token', null, { params });
        return response.data;
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }> {
        const params = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.appKey,
            client_secret: this.appSecret,
        };

        const response = await this.httpClient.post('/oauth/token', null, { params });
        return response.data;
    }

    /**
     * Make signed API request
     */
    async makeApiRequest(
        method: string,
        params: Record<string, any>,
        accessToken?: string,
    ): Promise<any> {
        const timestamp = Date.now().toString();

        const requestParams: Record<string, any> = {
            method,
            app_key: this.appKey,
            timestamp,
            sign_method: 'sha256',
            format: 'json',
            v: '2.0',
            ...params,
        };

        // Add access token if provided
        if (accessToken) {
            requestParams['session'] = accessToken;
        }

        // Generate signature
        const sign = this.generateSignature(requestParams);
        requestParams['sign'] = sign;

        const response = await this.httpClient.post('/sync', null, {
            params: requestParams,
        });

        return response.data;
    }

    /**
     * Generate request signature (HMAC-SHA256)
     */
    private generateSignature(params: Record<string, any>): string {
        // Sort parameters alphabetically
        const sortedKeys = Object.keys(params).sort();

        // Concatenate key-value pairs
        let signString = this.appSecret;
        sortedKeys.forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                signString += key + params[key];
            }
        });
        signString += this.appSecret;

        // Calculate HMAC-SHA256 and convert to uppercase hex
        return crypto
            .createHmac('sha256', this.appSecret)
            .update(signString, 'utf8')
            .digest('hex')
            .toUpperCase();
    }

    /**
     * Generate random state for OAuth
     */
    private generateState(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Search/Get products feed (Dropshipping API)
     * Uses aliexpress.ds.recommend.feed.get for product discovery
     */
    async searchProducts(params: {
        feed_name?: string;
        category_id?: string;
        page_no?: number;
        page_size?: number;
        sort?: string;
        target_currency?: string;
        target_language?: string;
    }, accessToken?: string): Promise<any> {
        return this.makeApiRequest(
            'aliexpress.ds.recommend.feed.get',
            {
                feed_name: params.feed_name || 'DS_all_products',
                category_id: params.category_id,
                page_no: params.page_no || 1,
                page_size: params.page_size || 20,
                sort: params.sort,
                target_currency: params.target_currency || 'USD',
                target_language: params.target_language || 'EN',
            },
            accessToken,
        );
    }

    /**
     * Get product details (Dropshipping API)
     * Uses aliexpress.ds.product.get for single product information
     */
    async getProductDetails(productId: string, params?: {
        target_currency?: string;
        target_language?: string;
        ship_to_country?: string;
    }, accessToken?: string): Promise<any> {
        return this.makeApiRequest(
            'aliexpress.ds.product.get',
            {
                product_id: productId,
                target_currency: params?.target_currency || 'USD',
                target_language: params?.target_language || 'EN',
                ship_to_country: params?.ship_to_country || 'US',
            },
            accessToken,
        );
    }

    /**
     * Search products by image (Dropshipping API)
     */
    async searchByImage(imageUrl: string, params?: {
        category_id?: string;
        page_no?: number;
        page_size?: number;
    }, accessToken?: string): Promise<any> {
        return this.makeApiRequest(
            'aliexpress.ds.image.search',
            {
                image_file_url: imageUrl,
                category_id: params?.category_id,
                page_no: params?.page_no || 1,
                page_size: params?.page_size || 20,
            },
            accessToken,
        );
    }
}
