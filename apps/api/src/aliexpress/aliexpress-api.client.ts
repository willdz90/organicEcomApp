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
     * According to official AliExpress OAuth flow
     * 
     * @param code - Authorization code from OAuth callback
     * @returns Access token, refresh token, and expiration info
     */
    async getAccessToken(code: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
        refresh_expires_in?: number;
        user_id?: string;
        seller_id?: string;
        account?: string;
        code?: string;
        request_id?: string;
    }> {
        const apiPath = '/auth/token/create';
        const timestamp = Date.now().toString();

        // OAuth token parameters (NO format parameter for this endpoint)
        const params = {
            app_key: this.appKey,
            sign_method: 'sha256',
            timestamp,
            code,
        };

        console.log('🔍 Token Exchange Request:');
        console.log('  Timestamp:', timestamp);
        console.log('  Code:', code);

        // Generate signature WITHOUT apiPath for OAuth endpoints
        // OAuth uses: appSecret + key1value1... + appSecret
        const sign = this.generateOAuthSignature(params);

        const requestBody = {
            ...params,
            sign,
        };

        console.log('  Request Params:', requestBody);

        try {
            // POST to /rest/auth/token/create
            // Official docs: "This interface must be submitted using the POST method"
            const response = await this.httpClient.post('/rest' + apiPath,
                new URLSearchParams(requestBody as any).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    }
                }
            );

            console.log('✅ Token Exchange Success:', response.data);

            if (response.data.code && response.data.code !== '0') {
                throw new Error(`Token exchange failed: ${response.data.message || 'Unknown error'}`);
            }

            return response.data;

        } catch (error: any) {
            console.error('❌ Token Exchange Error:', error.response?.data || error.message);
            throw new Error(`AliExpress token exchange failed: ${error.response?.data?.message || error.message}`);
        }
    }


    /**
     * Refresh access token using refresh token
     * According to official AliExpress OAuth flow
     * 
     * @param refreshToken - Refresh token from previous token exchange
     * @returns New access token, refresh token, and expiration info
     */
    async refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
        refresh_expires_in?: number;
        user_id?: string;
        seller_id?: string;
        account?: string;
        code?: string;
        request_id?: string;
    }> {
        const apiPath = '/auth/token/refresh';
        const timestamp = Date.now().toString();

        const params = {
            app_key: this.appKey,
            refresh_token: refreshToken,
            sign_method: 'sha256',
            timestamp,
        };

        console.log('🔄 Token Refresh Request:');
        console.log('  Timestamp:', timestamp);

        // Generate signature WITHOUT apiPath for OAuth endpoints
        const sign = this.generateOAuthSignature(params);

        const requestBody = {
            ...params,
            sign,
        };

        try {
            const response = await this.httpClient.post('/rest' + apiPath,
                new URLSearchParams(requestBody as any).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    }
                }
            );

            console.log('✅ Token Refresh Success:', response.data);

            if (response.data.code && response.data.code !== '0') {
                throw new Error(`Token refresh failed: ${response.data.message || 'Unknown error'}`);
            }

            return response.data;

        } catch (error: any) {
            console.error('❌ Token Refresh Error:', error.response?.data || error.message);
            throw new Error(`AliExpress token refresh failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Make signed API request to Business APIs
     * Business APIs use /sync endpoint with 'method' parameter
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

        // Generate signature with method as apiPath for Business APIs
        const sign = this.generateSignature(requestParams, method);
        requestParams['sign'] = sign;

        const response = await this.httpClient.post('/sync', null, {
            params: requestParams,
        });

        return response.data;
    }

    /**
     * Generate signature for OAuth endpoints (token/refresh)
     * OAuth endpoints use: appSecret + key1value1key2value2... + appSecret
     * NO apiPath prepended for OAuth
     * 
     * @param params - Request parameters to sign (without 'sign')
     * @returns Signature in uppercase hexadecimal format
     */
    private generateOAuthSignature(params: Record<string, any>): string {
        // Sort parameters alphabetically (exclude 'sign')
        const sortedKeys = Object.keys(params)
            .filter(key => key !== 'sign')
            .sort();

        // Concatenate as key1value1key2value2...
        let concatenated = '';
        sortedKeys.forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                concatenated += key + params[key];
            }
        });

        // OAuth format: appSecret + concatenated + appSecret
        const stringToSign = this.appSecret + concatenated + this.appSecret;

        console.log('🔐 OAuth Signature Generation:');
        console.log('  Sorted Keys:', sortedKeys);
        console.log('  String to Sign (first 50 chars):', stringToSign.substring(0, 50) + '...');
        console.log('  String to Sign (last 30 chars):', '...' + stringToSign.substring(stringToSign.length - 30));
        console.log('  String Length:', stringToSign.length);

        // HMAC-SHA256 with appSecret as key
        const signature = crypto
            .createHmac('sha256', this.appSecret)
            .update(stringToSign, 'utf8')
            .digest('hex')
            .toUpperCase();

        console.log('  Generated Signature:', signature);

        return signature;
    }

    /**
     * Generate signature using official AliExpress algorithm (HMAC-SHA256)
     * For Business APIs - includes apiPath in stringToSign
     * According to Alibaba documentation (docId: 120322)
     * 
     * Algorithm:
     * 1. Sort all parameters alphabetically (exclude 'sign')
     * 2. Concatenate as: key1value1key2value2...
     * 3. Prepend apiPath: apiPath + concatenated
     * 4. HMAC-SHA256 with appSecret as key
     * 5. Convert to uppercase hexadecimal
     * 
     * @param params - Request parameters to sign (without 'sign')
     * @param apiPath - API endpoint path (e.g., 'aliexpress.ds.product.get')
     * @returns Signature in uppercase hexadecimal format
     */
    private generateSignature(params: Record<string, any>, apiPath: string): string {
        // Step 1: Sort parameters alphabetically (exclude 'sign')
        const sortedKeys = Object.keys(params)
            .filter(key => key !== 'sign')
            .sort();

        // Step 2: Concatenate as key1value1key2value2...
        let concatenated = '';
        sortedKeys.forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                concatenated += key + params[key];
            }
        });

        // Step 3: Prepend apiPath
        const stringToSign = apiPath + concatenated;

        console.log('🔐 Signature Generation:');
        console.log('  API Path:', apiPath);
        console.log('  Sorted Keys:', sortedKeys);
        console.log('  String to Sign:', stringToSign);
        console.log('  String Length:', stringToSign.length);

        // Step 4: HMAC-SHA256 with appSecret as key
        const signature = crypto
            .createHmac('sha256', this.appSecret)
            .update(stringToSign, 'utf8')
            .digest('hex')
            .toUpperCase();

        console.log('  Generated Signature:', signature);

        return signature;
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
