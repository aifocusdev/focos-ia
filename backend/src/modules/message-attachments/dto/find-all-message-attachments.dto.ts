import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { AttachmentKind } from '../../../common/enums';

export class FindAllMessageAttachmentsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  message_id?: number;

  @IsOptional()
  @IsEnum(AttachmentKind)
  kind?: AttachmentKind;

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
  limit?: number = 10;
}
