import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { AliexpressService } from './aliexpress.service';

@Controller('aliexpress')
export class AliexpressController {
    private readonly logger = new Logger(AliexpressController.name);

    constructor(private readonly aliexpressService: AliexpressService) { }

    /**
     * Redirect user to AliExpress authorization page
     * GET /api/aliexpress/auth
     */
    @Get('auth')
    authorize(@Res() res: Response) {
        const authUrl = this.aliexpressService.getAuthorizationUrl();
        this.logger.log(`Redirecting to AliExpress: ${authUrl}`);
        return res.redirect(authUrl);
    }

    /**
     * Handle OAuth callback from AliExpress
     * GET /api/aliexpress/callback?code=xxx
     */
    @Get('callback')
    async callback(@Query('code') code: string, @Res() res: Response) {
        this.logger.log(`OAuth callback received`);

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Missing authorization code',
            });
        }

        try {
            const result = await this.aliexpressService.handleCallback(code);

            return res.json({
                success: true,
                message: 'AliExpress connected successfully',
                data: result,
            });
        } catch (error: any) {
            this.logger.error('Callback failed', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to connect AliExpress',
                error: error.message,
            });
        }
    }

    /**
     * Check AliExpress connection status
     * GET /api/aliexpress/status
     */
    @Get('status')
    async status() {
        const isConnected = await this.aliexpressService.isConnected();
        return {
            connected: isConnected,
        };
    }
}
