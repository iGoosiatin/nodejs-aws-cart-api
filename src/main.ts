import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';

import helmet from 'helmet';

import { AppModule } from './app.module';

let server: Handler;

async function createApp() {
  const app = await NestFactory.create(AppModule, { cors: false });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT') || 4000;
  await app.listen(port, () => {
    console.log('App is running on %s port', port);
  });
}

if (process.env.NODE_ENV !== 'aws') {
  bootstrap();
}

async function bootstrapServer(): Promise<Handler> {
  const app = await createApp();
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({
    app: expressApp,
    respondWithErrors: true,
  });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrapServer());
  return server(event, context, callback);
};
