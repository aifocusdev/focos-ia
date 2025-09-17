import { IsString, IsNotEmpty } from 'class-validator';

export class BotResponseDto {
  @IsString()
  @IsNotEmpty()
  output: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
