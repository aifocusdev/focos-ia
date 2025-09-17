import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env

export const databaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'focos_ia',
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV === 'development',
    extra: {
      timezone: 'America/Sao_Paulo',
    },
  };
};
