import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateServerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
