import {
  IsInt,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';
import { AttachmentKind } from '../../../common/enums';

export class CreateMessageAttachmentDto {
  @IsInt()
  message_id: number;

  @IsEnum(AttachmentKind)
  kind: AttachmentKind;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsString()
  @IsNotEmpty()
  mime_type: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  file_size?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_ms?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;
}
