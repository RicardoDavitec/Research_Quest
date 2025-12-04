import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ResearchQuest API')
    .setDescription(
      'API completa para gestão de pesquisas acadêmicas na área de saúde.\n\n' +
      '## Funcionalidades principais:\n' +
      '- 🔐 **Autenticação e Autorização**: JWT + Refresh Token\n' +
      '- 🏛️ **Instituições**: Gerenciamento completo de instituições acadêmicas\n' +
      '- 📋 **Projetos**: CRUD de projetos com coordenadores e membros\n' +
      '- 👥 **Grupos de Pesquisa**: Organização de equipes de pesquisa\n' +
      '- 🔬 **Pesquisas de Campo**: Planejamento e execução de coletas\n' +
      '- 📝 **Questionários**: Criação e gestão de questionários\n' +
      '- ❓ **Questões**: Banco de questões com import Excel/CSV\n' +
      '- ✅ **Aprovações**: Sistema de workflow de aprovações\n' +
      '- 🔔 **Notificações**: Sistema de notificações em tempo real\n' +
      '- 👤 **Usuários**: Gestão de usuários e pesquisadores\n\n' +
      '## Como usar:\n' +
      '1. Faça login em `/auth/signin` para obter o access token\n' +
      '2. Clique no botão "Authorize" e cole o token\n' +
      '3. Agora você pode testar todos os endpoints protegidos\n\n' +
      '## Banco de dados:\n' +
      '- PostgreSQL 16 com extensão pgVector\n' +
      '- 17 tabelas com relacionamentos complexos\n' +
      '- Suporte a busca semântica (pgVector)'
    )
    .setVersion('1.0.0')
    .setContact(
      'Ricardo David',
      'https://github.com/RicardoDavitec/Research_Quest',
      'ricardodavitec@example.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('Authentication', 'Endpoints de autenticação (SignUp, SignIn, Refresh Token, Logout)')
    .addTag('Users', 'Gerenciamento de usuários e pesquisadores')
    .addTag('Institutions', 'CRUD de instituições acadêmicas')
    .addTag('Projects', 'CRUD de projetos de pesquisa')
    .addTag('Research Groups', 'CRUD de grupos de pesquisa')
    .addTag('Field Surveys', 'CRUD de pesquisas de campo')
    .addTag('Questionnaires', 'CRUD de questionários')
    .addTag('Questions', 'CRUD de questões + Import Excel/CSV')
    .addTag('Approvals', 'Sistema de aprovações e workflow')
    .addTag('Notifications', 'Sistema de notificações')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Desenvolvimento Local')
    .addServer('http://172.21.31.152:3000', 'Servidor de Desenvolvimento')
    .build();
  
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      tryItOutEnabled: true,
    },
    customSiteTitle: 'ResearchQuest API Documentation',
    customfavIcon: 'https://nestjs.com/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0; }
      .swagger-ui .info .title { font-size: 2.5rem; }
    `,
  });

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 ResearchQuest API running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
