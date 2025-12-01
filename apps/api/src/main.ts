import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // 🔹 Orígenes permitidos para CORS
  // Siempre permitimos localhost para desarrollo
  const localOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  // 🔹 En producción añadimos el dominio del frontend desde env
  // Ejemplo en Vercel (API): FRONTEND_URL=https://tu-frontend.vercel.app
  const envOrigin = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : [];

  const allowedOrigins = [...localOrigins, ...envOrigin];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // ✅ Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 🔹 Prefijo global para la API: /api/...
  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Organic Ecom API')
    .setDescription('API para marketplace y análisis de productos')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);

  console.log('Allowed CORS origins:', allowedOrigins);
  console.log(`API running on http://localhost:${port}/api`);
  console.log(`Swagger on http://localhost:${port}/api/docs`);
}

bootstrap();
