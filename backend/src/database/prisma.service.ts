import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import * as mssql from 'mssql';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const config = {
      server: 'localhost',
      port: 1433,
      database: configService.get('DB_DATABASE'),
      user: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      options: {
        trustServerCertificate: true,
        encrypt: false,
        enableArithAbort: true
      }
    };

    const pool = new mssql.ConnectionPool(config);
    const adapter = new PrismaMssql(pool);
    
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma conectado ao SQL Server com sucesso');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
