// Legis Connect Identity Service Entrypoint
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  console.log('[Identity Service] Starting Legis Connect Identity Service...');
}
bootstrap();
