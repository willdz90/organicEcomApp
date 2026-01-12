import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // lee .env
    PrismaModule,
    HealthModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    AnalyticsModule,
    CategoriesModule,
  ],
})
export class AppModule { }
