import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { Request } from 'express';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly service: AnalyticsService) { }

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.ANALYST, Role.DATA_ENTRY, Role.VIEWER, Role.AUDITOR)
    getStats() {
        return this.service.getStats();
    }

    @Get('dashboard')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.ANALYST, Role.DATA_ENTRY, Role.VIEWER, Role.AUDITOR)
    getUserDashboard(@Req() req: Request) {
        const user = req.user as any;
        return this.service.getUserDashboard(user.sub);
    }

    @Post('dashboard')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.ANALYST, Role.DATA_ENTRY, Role.VIEWER, Role.AUDITOR)
    saveDashboard(@Body() body: { layout: any; widgets: any }, @Req() req: Request) {
        const user = req.user as any;
        return this.service.saveUserDashboard(user.sub, body.layout, body.widgets);
    }

    @Post('custom')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.ANALYST, Role.DATA_ENTRY, Role.VIEWER, Role.AUDITOR)
    getCustomStats(@Body() config: any) {
        return this.service.executeCustomQuery(config);
    }
}
