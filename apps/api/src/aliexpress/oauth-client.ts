import * as crypto from 'crypto';

export interface AliExpressOAuthClient {
    appKey: string;
    appSecret: string;
    apiUrl: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user_id: string;
    user_nick: string;
    refresh_token_valid_time: number;
}

export class AliExpressOAuth {
    private readonly appKey: string;
    private readonly appSecret: string;
    private readonly apiBaseUrl = 'https://api-sg.aliexpress.com';

    constructor(config: AliExpressOAuthClient) {
        this.appKey = config.appKey;
        this.appSecret = config.appSecret;
    }

    /**
     * Generate access token from authorization code
     */
    async generateToken(code: string): Promise<TokenResponse> {
        const params: any = {
            app_key: this.appKey,
            code,
            sign_method: 'sha256',
            timestamp: Date.now(),
            simplify: true,
        };

        // OP API uses method as part of URL path
        const method = '/auth/token/create';
        const signature = this.generateSignature(params, method);
        params.sign = signature;

        const url = this.buildUrl(method, params);

        console.log('🔧 Requesting token from:', url);

        const response = await fetch(url, {
            method: 'POST',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Token request failed:', response.status, errorText);
            throw new Error(`Token generation failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Token response received');

        if (!data || !data.access_token) {
            throw new Error(`Invalid response: ${JSON.stringify(data)}`);
        }

        return data;
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<TokenResponse> {
        const params: any = {
            app_key: this.appKey,
            refresh_token: refreshToken,
            sign_method: 'sha256',
            timestamp: Date.now(),
            simplify: true,
        };

        const method = '/auth/token/refresh';
        const signature = this.generateSignature(params, method);
        params.sign = signature;

        const url = this.buildUrl(method, params);

        const response = await fetch(url, {
            method: 'POST',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data || !data.access_token) {
            throw new Error(`Invalid response: ${JSON.stringify(data)}`);
        }

        return data;
    }

    /**
     * Generate signature for API request
     */
    private generateSignature(params: Record<string, any>, method: string): string {
        // Start with method as base string
        let baseString = method;

        // Sort parameters alphabetically (excluding 'sign')
        const sortedParams = Object.keys(params)
            .filter(key => key !== 'sign')
            .sort()
            .reduce((acc, key) => {
                acc[key] = params[key];
                return acc;
            }, {} as Record<string, any>);

        // Concatenate parameters
        for (const [key, value] of Object.entries(sortedParams)) {
            baseString += key + value;
        }

        // Generate HMAC-SHA256 signature
        const hmac = crypto.createHmac('sha256', this.appSecret);
        hmac.update(baseString, 'utf8');
        return hmac.digest('hex').toUpperCase();
    }

    /**
     * Build complete API URL
     */
    private buildUrl(method: string, params: Record<string, any>): string {
        const queryParams = new URLSearchParams();

        // Add all parameters except 'method' to query string
        for (const [key, value] of Object.entries(params)) {
            if (key !== 'method') {
                queryParams.append(key, String(value));
            }
        }

        return `${this.apiBaseUrl}${method}?${queryParams.toString()}`;
    }
}
