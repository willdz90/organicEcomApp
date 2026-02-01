import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { AliExpressOAuth } from './oauth-client';

@Injectable()
export class AliexpressService {
    private readonly logger = new Logger(AliexpressService.name);
    private readonly oauthClient: AliExpressOAuth;
    private readonly appKey: string;
    private readonly callbackUrl: string;
    private readonly apiUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.appKey = this.configService.get<string>('ALIEXPRESS_APP_KEY') ?? '';
        const appSecret = this.configService.get<string>('ALIEXPRESS_APP_SECRET') ?? '';
        this.callbackUrl = this.configService.get<string>('ALIEXPRESS_CALLBACK_URL') ?? '';
        this.apiUrl = this.configService.get<string>('ALIEXPRESS_API_URL') ?? '';

        // Initialize manual OAuth client
        this.oauthClient = new AliExpressOAuth({
            appKey: this.appKey,
            appSecret: appSecret,
            apiUrl: this.apiUrl,
        });

        this.logger.log('✅ AliExpress service initialized with manual OAuth client');
    }

    /**
     * Generate AliExpress authorization URL
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
     * Handle OAuth callback - Exchange code for tokens
     */
    async handleCallback(code: string) {
        this.logger.log('='.repeat(60));
        this.logger.log('📞 CALLBACK HANDLER STARTED');
        this.logger.log(`📥 Authorization Code: ${code}`);
        this.logger.log('='.repeat(60));

        try {
            // Check Public IP
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipRes.json();
                this.logger.log(`🌍 CURRENT SERVER PUBLIC IP: ${ipData.ip}`);
            } catch (e) {
                this.logger.warn('Could not fetch public IP');
            }

            // Use manual OAuth client to generate token
            this.logger.log('🔄 Calling OAuth client generateToken()...');
            const tokenData = await this.oauthClient.generateToken(code);

            this.logger.log('='.repeat(60));
            this.logger.log('✅ TOKEN GENERATED SUCCESSFULLY');
            this.logger.log(`👤 User ID: ${tokenData.user_id}`);
            this.logger.log(`🏷️  User Nick: ${tokenData.user_nick}`);
            this.logger.log(`⏰ Expires In: ${tokenData.expires_in}s`);
            this.logger.log('='.repeat(60));

            // Save to database
            await this.saveToken({
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in,
            });

            return {
                user_id: tokenData.user_id,
                user_nick: tokenData.user_nick,
                expires_in: tokenData.expires_in,
            };
        } catch (error: any) {
            this.logger.error('='.repeat(60));
            this.logger.error('❌ TOKEN GENERATION FAILED');
            this.logger.error(`Error: ${error.message}`);
            this.logger.error(`Stack: ${error.stack}`);
            this.logger.error('='.repeat(60));
            throw error;
        }
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken: string) {
        this.logger.log('Refreshing access token');

        try {
            const tokenData = await this.oauthClient.refreshToken(refreshToken);

            this.logger.log('✅ Token refreshed successfully');

            // Update in database
            await this.saveToken({
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in,
            });

            return tokenData;
        } catch (error: any) {
            this.logger.error('Token refresh failed', error);
            throw error;
        }
    }

    /**
     * Save token to database
     */
    private async saveToken(data: {
        accessToken: string;
        refreshToken?: string;
        expiresIn?: number;
    }) {
        const expiresAt = data.expiresIn
            ? new Date(Date.now() + data.expiresIn * 1000)
            : null;

        const existing = await this.prisma.aliexpressToken.findFirst({
            where: { userId: null },
        });

        if (existing) {
            await this.prisma.aliexpressToken.update({
                where: { id: existing.id },
                data: {
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken ?? null,
                    expiresAt,
                },
            });
            this.logger.log('Token updated in database');
        } else {
            await this.prisma.aliexpressToken.create({
                data: {
                    userId: null,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken ?? null,
                    expiresAt,
                },
            });
            this.logger.log('Token saved to database');
        }
    }

    /**
     * Get valid token
     */
    async getValidToken(): Promise<string | null> {
        const token = await this.prisma.aliexpressToken.findFirst({
            where: {
                expiresAt: { gt: new Date() },
            },
        });

        return token?.accessToken ?? null;
    }

    /**
     * Check if connected
     */
    async isConnected(): Promise<boolean> {
        const token = await this.getValidToken();
        return token !== null;
    }
}
