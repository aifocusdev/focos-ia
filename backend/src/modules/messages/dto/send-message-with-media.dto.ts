import { IsString, IsOptional } from 'class-validator';

export class SendMessageWithMediaDto {
  @IsOptional()
  @IsString()
  text?: string;
}
