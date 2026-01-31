import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const aliexpressApi = {
    // OAuth endpoints
    getAuthUrl: () => apiClient.get('/aliexpress/auth'),
    getStatus: () => apiClient.get('/aliexpress/status'),
    disconnect: () => apiClient.delete('/aliexpress/auth'),

    // Product endpoints
    searchProducts: (params: {
        keywords?: string;
        categoryId?: string;
        pageSize?: number;
        page?: number;
        sort?: string;
        minPrice?: number;
        maxPrice?: number;
    }) => apiClient.get('/aliexpress/products/search', { params }),

    getProductDetails: (id: string) => apiClient.get(`/aliexpress/products/${id}`),

    importProduct: (data: {
        aliexpressProductId: string;
        categoryId?: string;
        notes?: string;
    }) => apiClient.post('/aliexpress/products/import', data),

    syncProduct: (id: string) => apiClient.post(`/aliexpress/products/${id}/sync`),
};
