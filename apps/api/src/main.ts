// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // 🔹 Orígenes permitidos de forma explícita
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://organic-ecom-app-client.vercel.app',
    // Versión actual con hash que te está saliendo en el error
    'https://organic-ecom-app-client-g1g228o3x-willdz90s-projects.vercel.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 👀 Log para ver qué está llegando en los logs de Vercel
      console.warn('[CORS] Origin no permitido:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  // ✅ Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Prefijo global de la API
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
