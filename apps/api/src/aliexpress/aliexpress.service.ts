import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { createHmac } from 'crypto';
import axios from 'axios';
import { TokenResponseDto } from './dto/aliexpress-token.dto';

@Injectable()
export class AliexpressService {
    private readonly logger = new Logger(AliexpressService.name);
    private readonly appKey: string;
    private readonly appSecret: string;
    private readonly callbackUrl: string;
    private readonly apiUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.appKey = this.configService.get<string>('ALIEXPRESS_APP_KEY') || '';
        this.appSecret = this.configService.get<string>('ALIEXPRESS_APP_SECRET') || '';
        this.callbackUrl = this.configService.get<string>('ALIEXPRESS_CALLBACK_URL') || '';
        this.apiUrl = this.configService.get<string>('ALIEXPRESS_API_URL') || '';
    }

    /**
     * Generate the authorization URL to redirect users for OAuth
     */
    getAuthorizationUrl(): string {
        const params = new URLSearchParams({
            response_type: 'code',
            force_auth: 'true',
            redirect_uri: this.callbackUrl,
            client_id: this.appKey,
        });

        return `${this.apiUrl}/oauth/authorize?${params.toString()}`;
    }

    /**
     * Exchange authorization code for access token
     */
    async handleCallback(code: string): Promise<TokenResponseDto> {
        this.logger.log(`Exchanging authorization code for access token`);

        // Common parameters
        const timestamp = Date.now().toString();
        const params: Record<string, string> = {
            app_key: this.appKey,
            timestamp,
            sign_method: 'sha256',
            code, // Business parameter
            grant_type: 'authorization_code', // Required
            sp: 'ae', // Required for AliExpress
        };

        // Generate signature
        const apiMethod = '/auth/token/create';
        const signature = this.generateSignature(params, apiMethod);
        params.sign = signature;

        // Make HTTP request
        const url = `${this.apiUrl}${apiMethod}`;
        this.logger.debug(`GET ${url}`);
        this.logger.debug(`Params: ${JSON.stringify(params)}`);

        try {
            // AliExpress requires GET request with parameters in URL
            const response = await axios.get(url, {
                params,
            });

            this.logger.log('Token exchange successful');
            this.logger.log(`Response: ${JSON.stringify(response.data)}`);
            const tokenData: TokenResponseDto = response.data;

            // Save token to database
            await this.saveToken(tokenData);

            return tokenData;
        } catch (error: any) {
            this.logger.error('Token exchange failed');
            this.logger.error(`Status: ${error.response?.status}`);
            this.logger.error(`URL: ${url}`);
            this.logger.error(`Params: ${JSON.stringify(params)}`);
            this.logger.error(`Response data: ${JSON.stringify(error.response?.data)}`);
            this.logger.error(`Error message: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate HMAC-SHA256 signature for API calls
     * Following AliExpress signature algorithm specification
     */
    private generateSignature(params: Record<string, string>, apiMethod: string): string {
        // Sort parameters alphabetically
        const sortedKeys = Object.keys(params).sort();

        // Concatenate: apiMethod + key1value1key2value2...
        let signString = apiMethod;
        for (const key of sortedKeys) {
            signString += key + params[key];
        }

        this.logger.debug(`Sign string: ${signString}`);

        // Generate HMAC-SHA256
        const hmac = createHmac('sha256', this.appSecret);
        hmac.update(signString, 'utf8');

        // Convert to uppercase hex
        const signature = hmac.digest('hex').toUpperCase();
        this.logger.debug(`Signature: ${signature}`);

        return signature;
    }

    /**
     * Save token to database
     */
    private async saveToken(tokenData: TokenResponseDto): Promise<void> {
        const expiresAt = tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null;

        // Delete existing tokens (for now, single token support)
        await this.prisma.aliexpressToken.deleteMany({});

        // Create new token
        await this.prisma.aliexpressToken.create({
            data: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token || null,
                expiresAt: expiresAt || null,
            },
        });

        this.logger.log('Token saved to database');
    }

    /**
     * Get valid token from database
     */
    async getValidToken(): Promise<string | null> {
        const token = await this.prisma.aliexpressToken.findFirst({
            where: {
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return token?.accessToken || null;
    }

    /**
     * Check if AliExpress is connected (has valid token)
     */
    async isConnected(): Promise<boolean> {
        const token = await this.getValidToken();
        return !!token;
    }
}
