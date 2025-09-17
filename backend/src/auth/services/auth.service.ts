import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../modules/users/services/users.service';
import { User } from '../../modules/users/entities/user.entity';
import { JwtPayload, LoginResponse } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByUsername(username);
      if (user && (await bcrypt.compare(password, user.password))) {
        return user;
      }
    } catch {
      return null;
    }
    return null;
  }

  async login(user: User): Promise<LoginResponse> {
    const accessToken = await this.generateAccessToken(user);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role.name,
      },
    };
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role.name,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '2d', // 2 days
    });
  }
}
