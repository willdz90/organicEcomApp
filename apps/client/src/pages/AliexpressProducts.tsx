import React, { useState, useEffect } from "react";
import { Search, Filter, TrendingUp, Star, ShoppingCart, ExternalLink, Package } from "lucide-react";
import { api } from "../api/apiClient";

interface AliexpressProduct {
    id: string;
    title: string;
    description?: string;
    images: string[];
    originalPrice: number;
    salePrice?: number;
    currency: string;
    categoryPath?: string;
    brand?: string;
    orders: number;
    rating: number;
    reviewCount: number;
    freeShipping: boolean;
    aliexpressUrl: string;
}

export default function AliexpressProducts() {
    const [products, setProducts] = useState<AliexpressProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<'orders' | 'rating' | 'newest' | 'price'>('orders');

    useEffect(() => {
        loadProducts();
    }, [sortBy]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/aliexpress/products', {
                params: {
                    q: searchQuery,
                    sortBy,
                }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadProducts();
    };

    const seedMockData = async () => {
        try {
            await api.post('/aliexpress/seed-mock');
            loadProducts();
        } catch (error) {
            console.error('Error seeding mock data:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        AliExpress Catalog
                    </h1>
                    <p className="text-slate-500">
                        Browse and search products for dropshipping
                    </p>
                </div>
                {products.length === 0 && !loading && (
                    <button
                        onClick={seedMockData}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all font-medium"
                    >
                        <Package size={18} />
                        Load Sample Products
                    </button>
                )}
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-4">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                        <option value="orders">Most Orders</option>
                        <option value="rating">Best Rating</option>
                        <option value="newest">Newest</option>
                        <option value="price">Lowest Price</option>
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500">Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        No products found
                    </h3>
                    <p className="text-slate-500 mb-6">
                        Try loading sample products or adjusting your search
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all group"
                        >
                            {/* Image */}
                            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                <img
                                    src={product.images[0] || 'https://via.placeholder.com/400'}
                                    alt={product.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {product.freeShipping && (
                                    <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                        Free Shipping
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                    {product.title}
                                </h3>

                                {product.categoryPath && (
                                    <p className="text-xs text-slate-500 mb-3">{product.categoryPath}</p>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-4 mb-3 text-sm">
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star size={14} fill="currentColor" />
                                        <span className="font-medium">{product.rating.toFixed(1)}</span>
                                        <span className="text-slate-400">({product.reviewCount})</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <TrendingUp size={14} />
                                        <span>{product.orders.toLocaleString()} orders</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-2xl font-bold text-slate-900">
                                        ${product.salePrice || product.originalPrice}
                                    </span>
                                    {product.salePrice && (
                                        <span className="text-sm text-slate-400 line-through">
                                            ${product.originalPrice}
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <a
                                        href={product.aliexpressUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                                    >
                                        <ExternalLink size={14} />
                                        View on AliExpress
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
