import {
    Controller,
    Get,
    Post,
    Delete,
    Query,
    Param,
    Body,
    UseGuards,
    Req,
    Res,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AliexpressService } from './aliexpress.service';
import { AliexpressAuthService } from './aliexpress-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SearchProductsDto } from './dtos/search-products.dto';
import { ImportProductDto } from './dtos/import-product.dto';

@Controller('aliexpress')
export class AliexpressController {
    private readonly logger = new Logger(AliexpressController.name);

    constructor(
        private readonly aliexpressService: AliexpressService,
        private readonly authService: AliexpressAuthService,
    ) { }

    // ========== OAuth Endpoints ==========

    /**
     * Initiate OAuth flow - redirects to AliExpress authorization page
     */
    @Get('auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DATA_ENTRY, Role.ANALYST)
    async initiateAuth(@Req() req: Request, @Res() res: Response) {
        const user = req.user as any;
        const userId = user?.id ?? user?.sub;

        const authUrl = this.authService.getAuthorizationUrl(userId);

        return res.status(HttpStatus.OK).json({
            authUrl,
            message: 'Redirect user to this URL to authorize',
        });
    }

    /**
     * OAuth callback - handles authorization code and exchanges for tokens
     */
    @Get('callback')
    async handleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Res() res: Response,
    ) {
        try {
            if (!code || !state) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    error: 'Missing code or state parameter',
                });
            }

            const result = await this.authService.handleCallback(code, state);

            // Redirect to frontend success page
            const frontendUrl = process.env.NODE_ENV === 'production'
                ? 'https://organic-ecom-app-client.vercel.app'
                : 'http://localhost:5173';

            return res.redirect(`${frontendUrl}/aliexpress/connect?success=true`);
        } catch (error) {
            this.logger.error('OAuth callback error:', error);

            const frontendUrl = process.env.NODE_ENV === 'production'
                ? 'https://organic-ecom-app-client.vercel.app'
                : 'http://localhost:5173';

            return res.redirect(`${frontendUrl}/aliexpress/connect?error=auth_failed`);
        }
    }

    /**
     * Test endpoint: Exchange code for token (for Postman testing)
     */
    @Post('exchange-token')
    async exchangeToken(
        @Body() body: { code: string; userId: string },
    ) {
        try {
            if (!body.code) {
                return {
                    success: false,
                    error: 'Missing code parameter',
                };
            }

            // Generate a simple state with userId
            const state = Buffer.from(JSON.stringify({
                userId: body.userId || 'test-user',
                timestamp: Date.now(),
                random: Math.random().toString(36)
            })).toString('base64url');

            const result = await this.authService.handleCallback(body.code, state);

            return {
                success: true,
                message: 'Token obtained and stored successfully!',
                userId: result.userId,
                nextStep: 'Check database or call GET /api/aliexpress/status to verify'
            };
        } catch (error) {
            this.logger.error('Token exchange error:', error);
            const err = error as any;
            return {
                success: false,
                error: err.message || 'Failed to exchange code for token',
                details: err.toString()
            };
        }
    }

    /**
     * Get connection status
     */
    @Get('status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DATA_ENTRY, Role.ANALYST)
    async getStatus(@Req() req: Request) {
        const user = req.user as any;
        const userId = user?.id ?? user?.sub;

        const hasToken = await this.authService.hasValidToken(userId);

        return {
            connected: hasToken,
            userId,
        };
    }

    /**
     * Disconnect AliExpress account
     */
    @Delete('auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DATA_ENTRY, Role.ANALYST)
    async disconnect(@Req() req: Request) {
        const user = req.user as any;
        const userId = user?.id ?? user?.sub;

        await this.authService.revokeToken(userId);

        return {
            message: 'AliExpress account disconnected successfully',
        };
    }

    // ========== Product Endpoints ==========

    /**
     * Search products on AliExpress
     */
    @Get('products/search')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DATA_ENTRY, Role.ANALYST)
    async searchProducts(@Query() query: SearchProductsDto, @Req() req: Request) {
        const user = req.user as any;
        const userId = user?.id ?? user?.sub;

        return await this.aliexpressService.searchProducts(query, userId);
    }

    /**
     * Get product details
     */
    @Get('products/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DATA_ENTRY, Role.ANALYST)
    async getProductDetails(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as any;
        const userId = user?.id ?? user?.sub;

        return await this.aliexpressService.getProductDetails(id, userId);
    }

    /**
     * Import product to local catalog
     */
    @Post('products/import')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DATA_ENTRY)
    async importProduct(@Body() dto: ImportProductDto, @Req() req: Request) {
        const user = req.user as any;
        const userId = user?.id ?? user?.sub;

        return await this.aliexpressService.importProduct(
            dto.aliexpressProductId,
            userId,
            dto.categoryId,
        );
    }

    /**
     * Sync product data from AliExpress
     */
    @Post('products/:id/sync')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DATA_ENTRY)
    async syncProduct(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as any;
        const userId = user?.id ?? user?.sub;

        return await this.aliexpressService.syncProduct(id, userId);
    }
}
