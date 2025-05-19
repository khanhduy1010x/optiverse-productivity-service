import { Module, Global } from '@nestjs/common';
import { AxiosClient } from './axios-client';

@Global()
@Module({
  providers: [
    {
      provide: 'AXIOS_CLIENT',
      useFactory: () => new AxiosClient(''), 
    },
  ],
  exports: ['AXIOS_CLIENT'],
})
export class AxiosClientModule {}