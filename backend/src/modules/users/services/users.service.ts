import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FindAllUsersDto } from '../dto/find-all-users.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { USER_ERRORS } from '../constants/user.constants';
import { RolesService } from '../../roles/services/roles.service';
import { PasswordService } from '../../../common/services/password.service';
import { CacheService } from '../../../common/cache/cache.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly passwordService: PasswordService,
    private readonly cacheService: CacheService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.rolesService.findOne(createUserDto.role_id);

    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException(USER_ERRORS.USERNAME_EXISTS);
    }

    const hashedPassword = await this.passwordService.hashPassword(
      createUserDto.password,
    );
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async findAll(includeRole = false): Promise<User[]> {
    const relations = includeRole ? ['role'] : [];
    return await this.userRepository.find({
      relations,
      order: { created_at: 'ASC' },
    });
  }

  async findAllWithPagination(
    filters: FindAllUsersDto,
  ): Promise<PaginationResponseDto> {
    const {
      page = 1,
      limit = 10,
      includeRole = false,
      ...filterParams
    } = filters;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (includeRole) {
      queryBuilder.leftJoinAndSelect('user.role', 'role');
    }

    if (filterParams.name) {
      queryBuilder.andWhere('user.name ILIKE :name', {
        name: `%${filterParams.name}%`,
      });
    }

    if (filterParams.username) {
      queryBuilder.andWhere('user.username ILIKE :username', {
        username: `%${filterParams.username}%`,
      });
    }

    if (filterParams.role_id) {
      queryBuilder.andWhere('user.role_id = :role_id', {
        role_id: filterParams.role_id,
      });
    }

    if (typeof filterParams.online === 'boolean') {
      queryBuilder.andWhere('user.online = :online', {
        online: filterParams.online,
      });
    }

    queryBuilder.orderBy('user.created_at', 'ASC');

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number, includeRole = false): Promise<User> {
    if (!id || id <= 0) {
      throw new BadRequestException(USER_ERRORS.INVALID_ID);
    }

    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(
      'user',
      id.toString(),
      includeRole ? 'with_role' : 'basic',
    );
    const cachedUser = await this.cacheService.get<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const relations = includeRole ? ['role'] : [];
    const user = await this.userRepository.findOne({
      where: { id },
      relations,
    });

    if (!user) {
      throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    }

    // Cache the user for 15 minutes
    await this.cacheService.cacheWithTTL(cacheKey, user, 'user');

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    }
    return user;
  }

  async findByRole(roleId: number): Promise<User[]> {
    await this.rolesService.findOne(roleId);
    return await this.userRepository.find({
      where: { role_id: roleId },
      relations: ['role'],
      order: { created_at: 'ASC' },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.role_id) {
      await this.rolesService.findOne(updateUserDto.role_id);
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUser) {
        throw new ConflictException(USER_ERRORS.USERNAME_EXISTS);
      }
    }

    // Handle password hashing if provided
    if (updateUserDto.password) {
      const hashedPassword = await this.passwordService.hashPassword(
        updateUserDto.password,
      );
      updateUserDto.password = hashedPassword;
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Clear user cache
    const basicCacheKey = this.cacheService.generateKey(
      'user',
      id.toString(),
      'basic',
    );
    const rolesCacheKey = this.cacheService.generateKey(
      'user',
      id.toString(),
      'with_role',
    );
    await this.cacheService.del(basicCacheKey);
    await this.cacheService.del(rolesCacheKey);

    return updatedUser;
  }

  async updatePassword(id: number, password: string): Promise<User> {
    const user = await this.findOne(id);
    const hashedPassword = await this.passwordService.hashPassword(password);
    user.password = hashedPassword;
    return await this.userRepository.save(user);
  }

  async updateOnlineStatus(id: number, online: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.online = online;
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
