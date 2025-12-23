import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getStats() {
        // 1. Fetch products with basic relations
        const products = await this.prisma.product.findMany({
            select: {
                id: true,
                title: true,
                status: true,
                category: { select: { name: true } },
                countryGroups: true,
                sellPrice: true,
                cost: true,
                ratingAvg: true,
                mediaLinks: { select: { type: true } },
                analyses: { select: { viabilityScore: true, verdict: true } },
            },
        });

        const totalProducts = products.length;

        // 2. Performance KPIs
        const analyzedProducts = products.filter(p => p.analyses.length > 0);
        const winners = products.filter(p => p.analyses.some(a => a.verdict === 'viable'));
        const productsWithMedia = products.filter(p => p.mediaLinks.some(m => ['TIKTOK', 'REELS', 'YOUTUBE'].includes(m.type)));

        const analysisRate = totalProducts > 0 ? (analyzedProducts.length / totalProducts) * 100 : 0;
        const winnerRate = analyzedProducts.length > 0 ? (winners.length / analyzedProducts.length) * 100 : 0;
        const mediaCoverage = totalProducts > 0 ? (productsWithMedia.length / totalProducts) * 100 : 0;

        // 3. Status distribution (for "Catalog Health")
        const statusDist = products.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // 4. Country distribution
        const countryDist = products.reduce((acc, p) => {
            p.countryGroups.forEach(cg => {
                acc[cg] = (acc[cg] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>);

        // 5. Category distribution
        const categoryDist = products.reduce((acc, p) => {
            if (p.category) {
                const catName = p.category.name;
                acc[catName] = (acc[catName] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // 6. Financial Metrics
        let sumSell = 0;
        let productsWithPrice = 0;
        let sumCost = 0;

        products.forEach(p => {
            if (p.sellPrice && Number(p.sellPrice) > 0) {
                sumSell += Number(p.sellPrice);
                sumCost += Number(p.cost || 0);
                productsWithPrice++;
            }
        });

        const avgSellPrice = productsWithPrice > 0 ? sumSell / productsWithPrice : 0;
        const avgMargin = sumSell > 0 ? ((sumSell - sumCost) / sumSell) * 100 : 0;

        // 7. Quality Metrics
        const verdictDist: Record<string, number> = {};
        products.forEach(p => {
            p.analyses.forEach(a => {
                verdictDist[a.verdict] = (verdictDist[a.verdict] || 0) + 1;
            });
        });

        // 8. Robust Drill-down data
        const drillDown = {
            winners: winners.map(p => ({ id: p.id, title: p.title, status: p.status, price: p.sellPrice ? Number(p.sellPrice) : null })),
            noMedia: products.filter(p => p.mediaLinks.length === 0).map(p => ({ id: p.id, title: p.title, status: p.status, price: p.sellPrice ? Number(p.sellPrice) : null })),
            published: products.filter(p => p.status === 'PUBLISHED').map(p => ({ id: p.id, title: p.title, status: p.status, price: p.sellPrice ? Number(p.sellPrice) : null })),
            all: products.map(p => ({ id: p.id, title: p.title, status: p.status, price: p.sellPrice ? Number(p.sellPrice) : null, category: p.category?.name })),
            byCountry: products.reduce((acc, p) => {
                p.countryGroups.forEach(cg => {
                    if (!acc[cg]) acc[cg] = [];
                    acc[cg].push({ id: p.id, title: p.title, status: p.status, price: p.sellPrice ? Number(p.sellPrice) : null });
                });
                return acc;
            }, {} as Record<string, any[]>),
            byVerdict: products.reduce((acc, p) => {
                p.analyses.forEach(a => {
                    const v = a.verdict;
                    if (!acc[v]) acc[v] = [];
                    acc[v].push({ id: p.id, title: p.title, status: p.status, price: p.sellPrice ? Number(p.sellPrice) : null });
                });
                return acc;
            }, {} as Record<string, any[]>)
        };

        return {
            summary: {
                totalProducts,
                publishedCount: products.filter(p => p.status === 'PUBLISHED').length,
                analysisRate,
                winnerRate,
                mediaCoverage,
                avgSellPrice,
                avgMargin
            },
            distributions: {
                status: statusDist,
                category: categoryDist,
                country: countryDist,
                verdict: verdictDist
            },
            drillDown
        };
    }

    async executeCustomQuery(config: any) {
        const { dimension, metric, filters } = config;

        const where: any = {};
        if (filters?.minRating) {
            where.ratingAvg = { gte: filters.minRating };
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }

        const products = await this.prisma.product.findMany({
            where,
            select: {
                id: true,
                title: true,
                sellPrice: true,
                ratingAvg: true,
                category: { select: { name: true } },
                countryGroups: true,
                status: true,
            }
        });

        const grouping: Record<string, number | number[]> = {};

        products.forEach(p => {
            let keys: string[] = [];
            if (dimension === 'country') {
                keys = p.countryGroups.length > 0 ? p.countryGroups : ['Sin País'];
            } else if (dimension === 'category') {
                keys = [p.category?.name || 'Sin Categoría'];
            } else if (dimension === 'status') {
                keys = [p.status];
            }

            keys.forEach(key => {
                if (!grouping[key]) grouping[key] = metric === 'count' ? 0 : [];

                if (metric === 'count') {
                    (grouping[key] as number)++;
                } else if (metric === 'avgPrice') {
                    (grouping[key] as number[]).push(Number(p.sellPrice || 0));
                } else if (metric === 'avgRating') {
                    (grouping[key] as number[]).push(Number(p.ratingAvg || 0));
                }
            });
        });

        // Final result formatting
        return Object.entries(grouping).map(([name, val]) => ({
            name,
            value: Array.isArray(val)
                ? (val.length > 0 ? val.reduce((a, b) => a + b, 0) / val.length : 0)
                : val
        }));
    }

    async getUserDashboard(userId: string) {
        try {
            const prefs = await this.prisma.userPreference.findUnique({
                where: { userId },
            });
            return {
                layout: (prefs as any)?.dashboardLayout || null,
                widgets: (prefs as any)?.dashboardWidgets || null,
            };
        } catch (error) {
            return { layout: null, widgets: null };
        }
    }

    async saveUserDashboard(userId: string, layout: any, widgets: any) {
        try {
            return await this.prisma.userPreference.upsert({
                where: { userId },
                create: {
                    userId,
                    dashboardLayout: layout,
                    dashboardWidgets: widgets,
                },
                update: {
                    dashboardLayout: layout,
                    dashboardWidgets: widgets,
                },
            });
        } catch (error) {
            console.error("Failed to save dashboard (DB sync likely pending)", error);
            throw error;
        }
    }
}
