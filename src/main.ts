import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthMiddleware } from './midlleware/auth.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
   app.enableCors({
    origin: true,
    credentials: true, // nếu dùng cookie hoặc cần gửi token
  });
  app.use(new AuthMiddleware().use);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
