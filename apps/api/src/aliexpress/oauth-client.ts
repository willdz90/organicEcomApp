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
        console.log('🔧 OAuth Client initialized');
        console.log('   App Key:', this.appKey);
        console.log('   Base URL:', this.apiBaseUrl);
    }

    /**
     * Generate access token from authorization code
     */
    async generateToken(code: string): Promise<TokenResponse> {
        console.log('\n========== TOKEN GENERATION DEBUG ==========');
        console.log('📥 Received authorization code:', code);

        const params: any = {
            app_key: this.appKey,
            code,
            sign_method: 'sha256',
            timestamp: Date.now(),
            simplify: true,
        };

        console.log('📦 Parameters BEFORE signature:');
        console.log(JSON.stringify(params, null, 2));

        // OP API uses method as part of URL path
        const method = '/auth/token/create';
        console.log('🎯 Method:', method);

        const signature = this.generateSignature(params, method);
        params.sign = signature;

        console.log('✍️  Generated signature:', signature);
        console.log('📦 Parameters AFTER signature:');
        console.log(JSON.stringify(params, null, 2));

        const url = this.buildUrl(method, params);

        console.log('\n🌐 Complete Request Details:');
        console.log('   URL:', url);
        console.log('   Method: GET (OAuth endpoints require GET)');
        console.log('   Headers: (default fetch headers)');

        const response = await fetch(url, {
            method: 'GET',  // ✅ Changed from POST to GET
        });

        console.log('\n📨 Response received:');
        console.log('   Status:', response.status);
        console.log('   Status Text:', response.statusText);
        console.log('   Headers:', JSON.stringify([...response.headers.entries()], null, 2));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('\n❌ ERROR Response body:', errorText);
            console.error('========== END DEBUG ==========\n');
            throw new Error(`Token generation failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('\n✅ Success Response body:');
        console.log(JSON.stringify(data, null, 2));
        console.log('========== END DEBUG ==========\n');

        if (!data || !data.access_token) {
            throw new Error(`Invalid response: ${JSON.stringify(data)}`);
        }

        return data;
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<TokenResponse> {
        console.log('\n========== TOKEN REFRESH DEBUG ==========');
        console.log('📥 Refresh token received');

        const params: any = {
            app_key: this.appKey,
            refresh_token: refreshToken,
            sign_method: 'sha256',
            timestamp: Date.now(),
            simplify: true,
        };

        console.log('📦 Parameters:', JSON.stringify(params, null, 2));

        const method = '/auth/token/refresh';
        console.log('🎯 Method:', method);

        const signature = this.generateSignature(params, method);
        params.sign = signature;

        console.log('✍️  Signature:', signature);

        const url = this.buildUrl(method, params);
        console.log('🌐 URL:', url);

        const response = await fetch(url, {
            method: 'GET',  // ✅ Changed from POST to GET
        });

        console.log('📨 Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error:', errorText);
            console.log('========== END DEBUG ==========\n');
            throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Success:', JSON.stringify(data, null, 2));
        console.log('========== END DEBUG ==========\n');

        if (!data || !data.access_token) {
            throw new Error(`Invalid response: ${JSON.stringify(data)}`);
        }

        return data;
    }

    /**
     * Generate signature for API request
     */
    private generateSignature(params: Record<string, any>, method: string): string {
        console.log('\n🔐 Generating signature...');

        // Start with method as base string
        let baseString = method;
        console.log('   Step 1 - Method:', baseString);

        // Sort parameters alphabetically (excluding 'sign')
        const sortedParams = Object.keys(params)
            .filter(key => key !== 'sign')
            .sort()
            .reduce((acc, key) => {
                acc[key] = params[key];
                return acc;
            }, {} as Record<string, any>);

        console.log('   Step 2 - Sorted params:', JSON.stringify(sortedParams, null, 2));

        // Concatenate parameters
        for (const [key, value] of Object.entries(sortedParams)) {
            baseString += key + value;
        }

        console.log('   Step 3 - Base string:', baseString);

        // Generate HMAC-SHA256 signature
        const hmac = crypto.createHmac('sha256', this.appSecret);
        hmac.update(baseString, 'utf8');
        const signature = hmac.digest('hex').toUpperCase();

        console.log('   Step 4 - Final signature:', signature);

        return signature;
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

        const finalUrl = `${this.apiBaseUrl}${method}?${queryParams.toString()}`;

        console.log('\n🔗 URL Construction:');
        console.log('   Base:', this.apiBaseUrl);
        console.log('   Path:', method);
        console.log('   Query:', queryParams.toString());
        console.log('   Final:', finalUrl);

        return finalUrl;
    }
}
