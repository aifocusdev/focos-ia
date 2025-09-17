import {
  IsString,
  IsNotEmpty,
  Length,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 150)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 255)
  password: string;

  @IsNumber()
  @IsPositive()
  role_id: number;
}
