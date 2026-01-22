
import { Module } from '@nestjs/common';
import { AliexpressController } from './aliexpress.controller';
import { AliexpressService } from './aliexpress.service';
import { AliexpressApiClient } from './aliexpress-api.client';
import { PrismaModule } from '../database/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [AliexpressController],
    providers: [AliexpressService, AliexpressApiClient],
})
export class AliexpressModule { }
