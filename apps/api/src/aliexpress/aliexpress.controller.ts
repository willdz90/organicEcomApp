import { Controller, Get, Post, Body, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { AliexpressService } from './aliexpress.service';
import type { Response } from 'express';

@Controller('aliexpress')
export class AliexpressController {
    constructor(private readonly aliexpressService: AliexpressService) { }

    @Get('auth/url')
    async getAuthUrl() {
        const url = await this.aliexpressService.getAuthUrl();
        return { url };
    }

    @Get('callback')
    async callback(@Query('code') code: string, @Res() res: Response) {
        if (!code) {
            return res.status(400).json({ message: 'No code provided' });
        }

        try {
            // 1. Exchange code for token via Java Service
            const tokenData = await this.aliexpressService.exchangeToken(code);

            // 2. TODO: Save tokenData to User/Database
            console.log('Token received:', tokenData);

            // 3. Redirect back to frontend or show success
            // For now, return JSON
            return res.json({
                message: 'Authentication successful',
                data: tokenData
            });
        } catch (error) {
            return res.status(500).json({ message: 'Authentication failed', error: (error as any).message });
        }
    }
    @Post('refresh')
    async refresh(@Body('refresh_token') refreshToken: string) {
        if (!refreshToken) {
            throw new HttpException('refresh_token is required', HttpStatus.BAD_REQUEST);
        }
        const tokenData = await this.aliexpressService.refreshToken(refreshToken);
        return { message: 'Token refreshed', data: tokenData };
    }
}
