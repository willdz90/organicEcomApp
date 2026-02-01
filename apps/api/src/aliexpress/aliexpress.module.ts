import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AliexpressController } from './aliexpress.controller';
import { AliexpressService } from './aliexpress.service';
import { PrismaModule } from '../database/prisma.module';

@Module({
    imports: [ConfigModule, PrismaModule],
    controllers: [AliexpressController],
    providers: [AliexpressService],
    exports: [AliexpressService],
})
export class AliexpressModule { }
