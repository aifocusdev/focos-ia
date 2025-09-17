import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { ROLE_ERRORS } from '../constants/role.constants';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException(ROLE_ERRORS.ALREADY_EXISTS);
    }

    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      order: { created_at: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Role> {
    if (!id || id <= 0) {
      throw new BadRequestException(ROLE_ERRORS.INVALID_ID);
    }

    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(ROLE_ERRORS.NOT_FOUND);
    }
    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException(ROLE_ERRORS.NOT_FOUND);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existingRole) {
        throw new ConflictException(ROLE_ERRORS.ALREADY_EXISTS);
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException(ROLE_ERRORS.NOT_FOUND);
    }

    if (role.users && role.users.length > 0) {
      throw new ConflictException(ROLE_ERRORS.HAS_USERS);
    }

    await this.roleRepository.remove(role);
  }
}
