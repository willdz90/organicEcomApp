import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { AliexpressService } from './aliexpress.service';
import type { CallbackQueryDto } from './dto/aliexpress-token.dto';

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
        this.logger.log(`Redirecting to AliExpress authorization: ${authUrl}`);
        return res.redirect(authUrl);
    }

    /**
     * Handle OAuth callback from AliExpress
     * GET /api/aliexpress/callback?code=xxx
     */
    @Get('callback')
    async callback(@Query() query: CallbackQueryDto, @Res() res: Response) {
        this.logger.log(`Received callback with code: ${query.code}`);

        try {
            const tokenData = await this.aliexpressService.handleCallback(query.code);

            // Return success response
            return res.json({
                success: true,
                message: 'AliExpress connected successfully',
                data: {
                    user_id: tokenData.user_id,
                    user_nick: tokenData.user_nick,
                    expires_in: tokenData.expires_in,
                },
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
