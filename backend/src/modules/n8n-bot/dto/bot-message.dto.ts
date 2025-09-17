import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export enum BotMessageType {
  TEXT = 'Text',
  IMAGE = 'Image',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  DOCUMENT = 'Document',
}

export class BotMessageDto {
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @IsString()
  @IsNotEmpty()
  userID: string;

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsEnum(BotMessageType)
  type: BotMessageType;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  asset?: string;
}
