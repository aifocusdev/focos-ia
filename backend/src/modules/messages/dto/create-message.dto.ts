import {
  IsInt,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { MessageStatus } from '../../../common/enums';

export class CreateMessageDto {
  @IsInt()
  conversation_id: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  body?: string;

  @IsOptional()
  @IsString()
  whatsapp_message_id?: string;

  @IsOptional()
  @IsEnum(MessageStatus)
  whatsapp_status?: MessageStatus;

  @IsOptional()
  @IsDateString()
  delivered_at?: Date;

  @IsOptional()
  @IsDateString()
  read_at?: Date;
}
