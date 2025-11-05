import { Module, Global } from '@nestjs/common';
import { AxiosClient } from './axios-client';
import { UserHttpClient } from './user-http.client';
import { NotificationHttpClient } from './notification-http.client';
import { MembershipHttpClient } from './membership-http.client';

@Global()
@Module({
  providers: [
    {
      provide: 'AXIOS_CLIENT',
      useFactory: () => new AxiosClient(''),
    },
    UserHttpClient,
    NotificationHttpClient,
    MembershipHttpClient,
  ],
  exports: ['AXIOS_CLIENT', UserHttpClient, NotificationHttpClient, MembershipHttpClient],
})
export class AxiosClientModule {}
