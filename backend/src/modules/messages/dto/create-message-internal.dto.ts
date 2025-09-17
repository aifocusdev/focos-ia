import {
  IsInt,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { MessageSender, MessageStatus } from '../../../common/enums';

export class CreateMessageInternalDto {
  @IsInt()
  conversation_id: number;

  @IsEnum(MessageSender)
  sender_type: MessageSender;

  @IsOptional()
  @IsInt()
  sender_user?: number;

  @IsOptional()
  @IsInt()
  sender_bot?: number;

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
