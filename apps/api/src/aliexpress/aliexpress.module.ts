import { Module } from '@nestjs/common';
import { AliexpressService } from './aliexpress.service';
import { AliexpressController } from './aliexpress.controller';

@Module({
    controllers: [AliexpressController],
    providers: [AliexpressService],
})
export class AliexpressModule { }
