import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
} from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  body?: string;

  @IsOptional()
  @IsDateString()
  read_at?: Date;

  @IsOptional()
  @IsInt()
  sender_user?: number;
}
