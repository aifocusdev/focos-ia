import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Role } from '../entities/role.entity';

@Controller('roles')
@UseGuards(RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('admin')
  async findAll(): Promise<Role[]> {
    return await this.rolesService.findAll();
  }
}
