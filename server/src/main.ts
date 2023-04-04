import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthenticatedSocketIoAdapter } from './auth/authServer.adapter';

import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const port = 4000;
  const apiGlobalPrefix = 'api';

  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors();

  // All WS connections must be auth'd
  app.useWebSocketAdapter(new AuthenticatedSocketIoAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );

  app.setGlobalPrefix(apiGlobalPrefix);
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on port ${port} at /${apiGlobalPrefix}`,
  );
}

bootstrap();
