import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const useIntegratedSecurity = process.env.DB_INTEGRATED_SECURITY === 'true';

const dataSourceOptions: DataSourceOptions = {
  type: 'mssql',
  ...(useIntegratedSecurity ? {
    // Windows Authentication
    options: {
      trustedConnection: true,
      trustServerCertificate: true,
      enableArithAbort: true,
      instanceName: 'SQLEXPRESS',
    },
  } : {
    // SQL Authentication
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true,
      enableArithAbort: true,
    },
  }),
  host: process.env.DB_HOST?.replace('\\SQLEXPRESS', '') || 'localhost',
  database: process.env.DB_DATABASE || 'campo_research_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
} as any;

export { dataSourceOptions };

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
