import { useState, useEffect } from 'react';
import { aliexpressApi } from '../api/aliexpress.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface AliexpressProduct {
    product_id: string;
    product_title: string;
    product_main_image_url: string;
    target_sale_price: string;
    target_original_price?: string;
    evaluate_rate?: string;
    lastest_volume?: number;
}

export default function AliExpressCatalog() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<AliexpressProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState({
        keywords: '',
        page: 1,
        pageSize: 20,
        sort: 'orders_desc',
    });
    const [total, setTotal] = useState(0);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const response = await aliexpressApi.getStatus();
            if (!response.data.connected) {
                toast.warning('Please connect your AliExpress account first');
                navigate('/aliexpress/connect');
            }
        } catch (error) {
            console.error('Failed to check connection:', error);
            navigate('/aliexpress/connect');
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        setLoading(true);
        try {
            const response = await aliexpressApi.searchProducts(searchParams);
            setProducts(response.data.products || []);
            setTotal(response.data.total || 0);
        } catch (error: any) {
            console.error('Search failed:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please reconnect your AliExpress account.');
                navigate('/aliexpress/connect');
            } else {
                toast.error('Failed to search products. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (product: AliexpressProduct) => {
        setImporting(product.product_id);
        try {
            await aliexpressApi.importProduct({
                aliexpressProductId: product.product_id,
            });
            toast.success('Product imported successfully!');
        } catch (error) {
            console.error('Import failed:', error);
            toast.error('Failed to import product. Please try again.');
        } finally {
            setImporting(null);
        }
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => ({ ...prev, page: newPage }));
        setTimeout(() => handleSearch(), 0);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AliExpress Catalog</h1>
                <p className="text-gray-600">Search and import products from AliExpress</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6 bg-white rounded-lg shadow-md p-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchParams.keywords}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, keywords: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={searchParams.sort}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, sort: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="orders_desc">Most Orders</option>
                        <option value="rating_desc">Highest Rating</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {/* Results Count */}
            {total > 0 && (
                <div className="mb-4 text-gray-600">
                    Found {total.toLocaleString()} products
                </div>
            )}

            {/* Products Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">Try searching with different keywords</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.product_id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="aspect-square bg-gray-100">
                                    <img
                                        src={product.product_main_image_url}
                                        alt={product.product_title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 h-10">
                                        {product.product_title}
                                    </h3>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-xl font-bold text-blue-600">
                                            ${product.target_sale_price}
                                        </span>
                                        {product.target_original_price &&
                                            parseFloat(product.target_original_price) > parseFloat(product.target_sale_price) && (
                                                <span className="text-sm text-gray-500 line-through">
                                                    ${product.target_original_price}
                                                </span>
                                            )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                        {product.evaluate_rate && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-500">★</span>
                                                <span>{parseFloat(product.evaluate_rate).toFixed(1)}</span>
                                            </div>
                                        )}
                                        {product.lastest_volume !== undefined && (
                                            <div>
                                                {product.lastest_volume.toLocaleString()} orders
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleImport(product)}
                                        disabled={importing === product.product_id}
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                                    >
                                        {importing === product.product_id ? 'Importing...' : 'Import Product'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {total > searchParams.pageSize && (
                        <div className="mt-8 flex justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(searchParams.page - 1)}
                                disabled={searchParams.page === 1 || loading}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                Page {searchParams.page} of {Math.ceil(total / searchParams.pageSize)}
                            </div>
                            <button
                                onClick={() => handlePageChange(searchParams.page + 1)}
                                disabled={searchParams.page >= Math.ceil(total / searchParams.pageSize) || loading}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
