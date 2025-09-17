import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateBotDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
