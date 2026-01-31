import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { AliexpressService } from './aliexpress.service';
import { AliexpressController } from './aliexpress.controller';

@Module({
    imports: [PrismaModule],
    providers: [AliexpressService],
    controllers: [AliexpressController],
    exports: [AliexpressService],
})
export class AliexpressModule { }
