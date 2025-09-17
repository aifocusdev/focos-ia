import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/services/users.service';
import { RolesService } from '../src/modules/roles/services/roles.service';
import { CreateUserDto } from '../src/modules/users/dto/create-user.dto';
import { CreateRoleDto } from '../src/modules/roles/dto/create-role.dto';

async function createUsersAndRoles() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const rolesService = app.get(RolesService);

  try {

    // Definir as roles necessárias
    const rolesToCreate = [
      { name: 'admin' },
      { name: 'supervisor' },
      { name: 'employer' }
    ];

    // Criar as roles se não existirem
    const createdRoles = {};
    for (const roleData of rolesToCreate) {
      try {
        const existingRole = await rolesService.findByName(roleData.name);
        createdRoles[roleData.name] = existingRole;
      } catch {
        const newRole = await rolesService.create(roleData as CreateRoleDto);
        createdRoles[roleData.name] = newRole;
      }
    }


    // Definir os usuários
    const usersToCreate = [
      {
        name: 'Administrator',
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Supervisor',
        username: 'supervisor',
        password: 'supervisor123',
        role: 'supervisor'
      },
      {
        name: 'Employee',
        username: 'employer',
        password: 'employer123',
        role: 'employer'
      }
    ];

    // Criar os usuários
    for (const userData of usersToCreate) {
      try {
        const createUserDto: CreateUserDto = {
          name: userData.name,
          username: userData.username,
          password: userData.password,
          role_id: createdRoles[userData.role].id
        };

        const user = await usersService.create(createUserDto);
      } catch (error) {
        if (error.message.includes('Username already exists')) {
        } else {
          console.error(`❌ Erro ao criar usuário '${userData.username}':`, error.message, '\n');
        }
      }
    }

    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await app.close();
  }
}

// Executar o script
createUsersAndRoles().catch(console.error);