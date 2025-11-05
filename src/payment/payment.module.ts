import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Payment, PaymentSchema } from './payment.schema';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { AxiosClientModule } from '../http-axios/axios-client.module';
import { UserHttpClient } from '../http-axios/user-http.client';
import { UserInventoryModule } from '../user-inventory/user-inventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    ConfigModule,
    AxiosClientModule,
    UserInventoryModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, UserHttpClient],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
