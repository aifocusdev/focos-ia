import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/services/users.service';
import { RolesService } from '../src/modules/roles/services/roles.service';

async function listUsersAndRoles() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const rolesService = app.get(RolesService);

  try {

    // Listar todas as roles
    const roles = await rolesService.findAll();
    roles.forEach(role => {
    });

    // Listar todos os usuários com suas roles
    const users = await usersService.findAll(true);
    users.forEach(user => {
    });

    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await app.close();
  }
}

// Executar o script
listUsersAndRoles().catch(console.error);