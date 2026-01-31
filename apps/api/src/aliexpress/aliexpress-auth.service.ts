import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';
import type { AliexpressTokenResponse } from './interfaces/aliexpress-api.interface';

@Injectable()
export class AliexpressAuthService {
    private readonly logger = new Logger(AliexpressAuthService.name);
    private readonly appKey: string;
    private readonly appSecret: string;
    private readonly callbackUrl: string;
    private readonly apiUrl: string;

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.appKey = this.config.get<string>('ALIEXPRESS_APP_KEY')!;
        this.appSecret = this.config.get<string>('ALIEXPRESS_APP_SECRET')!;
        this.callbackUrl = this.config.get<string>('ALIEXPRESS_CALLBACK_URL')!;
        this.apiUrl = this.config.get<string>('ALIEXPRESS_API_URL')!;
    }

    /**
     * Generate authorization URL for OAuth flow
     */
    getAuthorizationUrl(userId: string): string {
        const state = this.generateState(userId);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.appKey,
            redirect_uri: this.callbackUrl,
            state,
            sp: 'ae', // Service Provider = AliExpress
            force_auth: 'true', // Force re-authentication
        });

        return `${this.apiUrl}/oauth/authorize?${params.toString()}`;
    }

    /**
     * Handle OAuth callback and exchange code for tokens
     */
    async handleCallback(code: string, state: string): Promise<{ userId: string }> {
        // Verify state and extract userId
        const userId = this.verifyState(state);

        if (!userId) {
            throw new UnauthorizedException('Invalid state parameter');
        }

        // Exchange code for tokens
        const tokens = await this.exchangeCodeForToken(code);

        // Calculate expiration time
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        // Store tokens in database
        await this.prisma.aliexpressToken.upsert({
            where: { userId },
            create: {
                userId,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt,
            },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt,
            },
        });

        this.logger.log(`Tokens stored for user ${userId}`);

        return { userId };
    }

    /**
     * Get valid access token for user (refresh if needed)
     */
    async getValidToken(userId: string): Promise<string> {
        const tokenRecord = await this.prisma.aliexpressToken.findUnique({
            where: { userId },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('AliExpress account not connected');
        }

        // Check if token is expired or about to expire (5 min buffer)
        const now = new Date();
        const expiryBuffer = new Date(tokenRecord.expiresAt.getTime() - 5 * 60 * 1000);

        if (now >= expiryBuffer) {
            this.logger.log(`Token expired for user ${userId}, refreshing...`);
            return await this.refreshAccessToken(userId);
        }

        return tokenRecord.accessToken;
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(userId: string): Promise<string> {
        const tokenRecord = await this.prisma.aliexpressToken.findUnique({
            where: { userId },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('AliExpress account not connected');
        }

        try {
            const tokens = await this.refreshToken(tokenRecord.refreshToken);
            const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

            await this.prisma.aliexpressToken.update({
                where: { userId },
                data: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt,
                },
            });

            this.logger.log(`Token refreshed for user ${userId}`);

            return tokens.access_token;
        } catch (error) {
            this.logger.error(`Failed to refresh token for user ${userId}:`, error);
            // If refresh fails, delete the token record
            await this.prisma.aliexpressToken.delete({ where: { userId } });
            throw new UnauthorizedException('Failed to refresh token. Please reconnect your AliExpress account.');
        }
    }

    /**
     * Revoke token and disconnect account
     */
    async revokeToken(userId: string): Promise<void> {
        await this.prisma.aliexpressToken.delete({
            where: { userId },
        });

        this.logger.log(`Token revoked for user ${userId}`);
    }

    /**
     * Check if user has valid token
     */
    async hasValidToken(userId: string): Promise<boolean> {
        try {
            await this.getValidToken(userId);
            return true;
        } catch {
            return false;
        }
    }

    // ========== Private Methods ==========

    /**
     * Exchange authorization code for access token
     */
    private async exchangeCodeForToken(code: string): Promise<AliexpressTokenResponse> {
        const timestamp = Date.now().toString();

        const params = {
            app_key: this.appKey,
            timestamp,
            sign_method: 'sha256',
            code,
        };

        const sign = this.generateSign(params);

        this.logger.log('Exchanging code for token...');
        this.logger.log(`Request params: ${JSON.stringify({ ...params, sign: sign.substring(0, 10) + '...' })}`);

        try {
            // Use POST with form-urlencoded (per documentation)
            const formData = new URLSearchParams();
            formData.append('app_key', params.app_key);
            formData.append('timestamp', params.timestamp);
            formData.append('sign_method', params.sign_method);
            formData.append('code', params.code);
            formData.append('sign', sign);

            const response = await axios.post(
                `${this.apiUrl}/auth/token/create`,
                formData.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    },
                }
            );

            this.logger.log(`AliExpress Response Status: ${response.status}`);
            this.logger.log(`AliExpress Response Data: ${JSON.stringify(response.data)}`);

            // GOP protocol response structure
            if (response.data.code !== '0' && response.data.code !== 0) {
                this.logger.error('AliExpress API Error:', response.data);
                throw new Error(response.data.message || 'Unknown error from AliExpress');
            }

            const tokenData = response.data.data;

            if (!tokenData) {
                this.logger.error('No token response in data:', response.data);
                throw new Error('Invalid response structure from AliExpress API');
            }

            if (!tokenData.access_token) {
                this.logger.error('No access_token in response:', tokenData);
                throw new Error('No access token in AliExpress response');
            }

            // Convert GOP response to our interface format
            const tokenResponse: AliexpressTokenResponse = {
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_in: tokenData.expire_time || 86400,
                refresh_expires_in: tokenData.refresh_token_valid_time || 2592000,
                user_id: tokenData.user_id,
                havana_id: tokenData.havana_id,
            };

            this.logger.log('Token exchange successful');
            return tokenResponse;
        } catch (error) {
            this.logger.error('Failed to exchange code for token:', error);
            if (axios.isAxiosError(error)) {
                this.logger.error('Axios error details:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            }
            throw new UnauthorizedException('Failed to obtain access token: ' + (error as any).message);
        }
    }

    /**
     * Refresh access token
     */
    private async refreshToken(refreshToken: string): Promise<AliexpressTokenResponse> {
        const timestamp = Date.now().toString();

        const params = {
            app_key: this.appKey,
            timestamp,
            sign_method: 'sha256',
            refresh_token: refreshToken,
        };

        const sign = this.generateSign(params);

        try {
            const formData = new URLSearchParams();
            formData.append('app_key', params.app_key);
            formData.append('timestamp', params.timestamp);
            formData.append('sign_method', params.sign_method);
            formData.append('refresh_token', params.refresh_token);
            formData.append('sign', sign);

            const response = await axios.post(
                `${this.apiUrl}/auth/token/refresh`,
                formData.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    },
                }
            );

            if (response.data.code !== '0' && response.data.code !== 0) {
                throw new Error(response.data.message || 'Token refresh failed');
            }

            const tokenData = response.data.data;

            if (!tokenData || !tokenData.access_token) {
                throw new Error('Invalid refresh response from AliExpress');
            }

            return {
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_in: tokenData.expire_time || 86400,
                refresh_expires_in: tokenData.refresh_token_valid_time || 2592000,
                user_id: tokenData.user_id,
                havana_id: tokenData.havana_id,
            };
        } catch (error) {
            this.logger.error('Failed to refresh token:', error);
            throw new Error('Failed to refresh access token');
        }
    }

    /**
     * Generate signature for API request
     */
    private generateSign(params: Record<string, string>): string {
        // Sort parameters alphabetically
        const sortedKeys = Object.keys(params).sort();

        // Concatenate key-value pairs
        let signString = this.appSecret;
        for (const key of sortedKeys) {
            signString += key + params[key];
        }
        signString += this.appSecret;

        // Generate HMAC-SHA256 (uppercase hex)
        return crypto
            .createHmac('sha256', this.appSecret)
            .update(signString, 'utf8')
            .digest('hex')
            .toUpperCase();
    }

    /**
     * Generate state parameter with userId encoded
     */
    private generateState(userId: string): string {
        const random = crypto.randomBytes(16).toString('hex');
        const data = JSON.stringify({ userId, random, timestamp: Date.now() });
        return Buffer.from(data).toString('base64url');
    }

    /**
     * Verify state parameter and extract userId
     */
    private verifyState(state: string): string | null {
        try {
            const data = JSON.parse(Buffer.from(state, 'base64url').toString());

            // Verify timestamp (state should be used within 10 minutes)
            const now = Date.now();
            if (now - data.timestamp > 10 * 60 * 1000) {
                this.logger.warn('State parameter expired');
                return null;
            }

            return data.userId;
        } catch (error) {
            this.logger.error('Failed to verify state:', error);
            return null;
        }
    }
}
