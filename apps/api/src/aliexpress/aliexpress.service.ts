import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AliexpressService {
    private readonly javaServiceUrl = process.env.ALIEXPRESS_JAVA_SERVICE_URL || 'http://localhost:8080';

    async getAuthUrl(): Promise<string> {
        try {
            const response = await axios.get(`${this.javaServiceUrl}/auth/url`);
            return response.data;
        } catch (error) {
            throw new HttpException(
                'Failed to get auth URL from Java Service',
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    async exchangeToken(code: string): Promise<any> {
        try {
            const response = await axios.post(`${this.javaServiceUrl}/auth/token`, { code });
            return response.data;
        } catch (error: any) {
            console.error('Java Service Error:', error.response?.data || error.message);
            throw new HttpException(
                error.response?.data || 'Failed to exchange token via Java Service',
                HttpStatus.BAD_GATEWAY,
            );
        }
    }
    async refreshToken(refreshToken: string): Promise<any> {
        try {
            const response = await axios.post(`${this.javaServiceUrl}/auth/refresh`, { refresh_token: refreshToken });
            return response.data;
        } catch (error: any) {
            console.error('Java Service Refresh Error:', error.response?.data || error.message);
            throw new HttpException(
                error.response?.data || 'Failed to refresh token via Java Service',
                HttpStatus.BAD_GATEWAY,
            );
        }
    }
}
