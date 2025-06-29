import { Module, Global } from '@nestjs/common';
import { AxiosClient } from './axios-client';
import { UserHttpClient } from './user-http.client';

@Global()
@Module({
  providers: [
    {
      provide: 'AXIOS_CLIENT',
      useFactory: () => new AxiosClient(''),
    },
    UserHttpClient,
  ],
  exports: ['AXIOS_CLIENT', UserHttpClient],
})
export class AxiosClientModule {}
