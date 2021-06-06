import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'HEAD,OPTIONS,GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: '*',
    preflightContinue: false,
    credentials: true,
    optionsSuccessStatus: 204,
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
