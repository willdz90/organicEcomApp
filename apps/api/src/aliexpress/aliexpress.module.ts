import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AliexpressController } from './aliexpress.controller';
import { AliexpressService } from './aliexpress.service';
import { AliexpressAuthService } from './aliexpress-auth.service';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AliexpressController],
  providers: [AliexpressService, AliexpressAuthService],
  exports: [AliexpressService],
})
export class AliexpressModule {}
