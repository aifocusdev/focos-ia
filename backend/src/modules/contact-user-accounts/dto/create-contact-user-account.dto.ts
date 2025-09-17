import {
  IsInt,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateContactUserAccountDto {
  @IsInt()
  contact_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  username_final: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password_final: string;

  @IsInt()
  server_id: number;

  @IsOptional()
  @IsInt()
  id_line_server?: number;

  @IsOptional()
  @IsDate()
  date_exp?: Date;

  @IsOptional()
  @IsInt()
  application_id?: number;

  @IsOptional()
  @IsInt()
  device_id?: number;
}
