
import { Module } from '@nestjs/common';
import { AliexpressController } from './aliexpress.controller';
import { AliexpressService } from './aliexpress.service';
import { PrismaModule } from '../database/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AliexpressController],
    providers: [AliexpressService],
})
export class AliexpressModule { }
