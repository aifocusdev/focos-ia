import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/services/users.service';
import { RolesService } from '../src/modules/roles/services/roles.service';
import { CreateUserDto } from '../src/modules/users/dto/create-user.dto';

async function createSupervisorUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const rolesService = app.get(RolesService);

  try {

    // Buscar a role supervisor
    const supervisorRole = await rolesService.findByName('supervisor');

    // Tentar criar o usuário supervisor
    try {
      const createUserDto: CreateUserDto = {
        name: 'Supervisor User',
        username: 'supervisor',
        password: 'supervisor123',
        role_id: supervisorRole.id
      };

      const user = await usersService.create(createUserDto);
    } catch (error) {
      if (error.message.includes('Username already exists')) {
        
        // Verificar qual usuário já existe
        try {
          const existingUser = await usersService.findByUsername('supervisor');
        } catch (findError) {
        }
      } else {
        console.error(`❌ Erro ao criar usuário supervisor:`, error.message);
      }
    }

    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    await app.close();
  }
}

// Executar o script
createSupervisorUser().catch(console.error);