import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MessageSender } from '../../../common/enums';

export class FindAllMessagesDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  conversation_id?: number;

  @IsOptional()
  @IsEnum(MessageSender)
  sender_type?: MessageSender;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  sender_user?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  sender_bot?: number;

  @IsOptional()
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;

  @IsOptional()
  @Transform(({ value }) => String(value) === 'true')
  unread_only?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  @Min(1)
  @Max(2000)
  limit?: number = 20;
}
