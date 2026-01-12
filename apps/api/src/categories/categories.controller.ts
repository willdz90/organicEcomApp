import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('tree')
    async getCategoryTree() {
        // Get all categories with their parent relationships
        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
            select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                parentId: true,
                order: true,
            },
        });

        // Build hierarchical structure
        const rootCategories = categories.filter(c => !c.parentId);
        const tree = rootCategories.map(root => ({
            ...root,
            children: categories.filter(c => c.parentId === root.id),
        }));

        return tree;
    }

    @Get('flat')
    async getCategoriesFlat() {
        // Get all categories in a flat list (for simple selects)
        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
            select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                parentId: true,
            },
        });

        return categories;
    }
}
