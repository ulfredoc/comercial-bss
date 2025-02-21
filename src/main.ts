import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Obtener el ConfigService
  const configService = app.get(ConfigService);
  
  // Obtener el JWT_SECRET del .env
  const jwtSecret = configService.get('JWT_SECRET');
  
  // Configuración de la sesión usando el JWT_SECRET del .env
  app.use(
    session({
      secret: jwtSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60000 * 60, // 1 hora
      },
    }),
  );

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
}
bootstrap();