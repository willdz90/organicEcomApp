import { useState, useEffect } from 'react';
import { aliexpressApi } from '../api/aliexpress.api';
import { toast } from 'react-toastify';

export default function AliExpressConnect() {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkConnectionStatus();

        // Check for OAuth callback success/error
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            toast.success('AliExpress account connected successfully!');
            setIsConnected(true);
            // Clean URL
            window.history.replaceState({}, '', '/aliexpress/connect');
        } else if (params.get('error')) {
            toast.error('Failed to connect AliExpress account. Please try again.');
        }
    }, []);

    const checkConnectionStatus = async () => {
        try {
            const response = await aliexpressApi.getStatus();
            setIsConnected(response.data.connected);
        } catch (error) {
            console.error('Failed to check connection status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            const response = await aliexpressApi.getAuthUrl();
            const authUrl = response.data.authUrl;

            // Redirect to AliExpress authorization page
            window.location.href = authUrl;
        } catch (error) {
            console.error('Failed to get auth URL:', error);
            toast.error('Failed to initiate connection. Please try again.');
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect your AliExpress account?')) {
            return;
        }

        try {
            await aliexpressApi.disconnect();
            setIsConnected(false);
            toast.success('AliExpress account disconnected successfully');
        } catch (error) {
            console.error('Failed to disconnect:', error);
            toast.error('Failed to disconnect account. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AliExpress Integration</h1>
                        <p className="text-gray-600 mt-2">
                            Connect your AliExpress account to import products
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${isConnected
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {isConnected ? '✓ Connected' : '○ Not Connected'}
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    {!isConnected ? (
                        <div className="text-center py-8">
                            <div className="mb-6">
                                <svg
                                    className="mx-auto h-24 w-24 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Connect to AliExpress
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Authorize this application to access your AliExpress Dropshipper account.
                                You'll be redirected to AliExpress to complete the authorization.
                            </p>
                            <button
                                onClick={handleConnect}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Connect AliExpress Account
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="mb-6">
                                <svg
                                    className="mx-auto h-24 w-24 text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Account Connected
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Your AliExpress account is successfully connected.
                                You can now browse and import products.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <a
                                    href="/aliexpress/catalog"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Browse Products
                                </a>
                                <button
                                    onClick={handleDisconnect}
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Disconnect Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">🔍 Product Search</h4>
                            <p className="text-sm text-gray-600">
                                Search millions of products from AliExpress catalog
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">📦 Easy Import</h4>
                            <p className="text-sm text-gray-600">
                                Import products directly to your catalog with one click
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">🔄 Auto Sync</h4>
                            <p className="text-sm text-gray-600">
                                Keep prices and inventory synchronized automatically
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
