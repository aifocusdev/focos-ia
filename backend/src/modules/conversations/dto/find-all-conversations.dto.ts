import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsIn,
  IsBoolean,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ContactType } from '../../../common/enums/contact-type.enum';

export class FindAllConversationsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  contact_id?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  assigned_bot?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  unassignment?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  unread?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) => parseInt(String(v)))
      : [parseInt(String(value))],
  )
  tag_ids?: number[];

  @IsOptional()
  @IsString()
  search?: string;

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

  @IsOptional()
  @IsString()
  @IsIn(['id', 'created_at', 'updated_at', 'last_activity_at'])
  sortBy?: string = 'last_activity_at';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';

  @IsOptional()
  @IsEnum(ContactType)
  contact_type?: ContactType;

  @IsOptional()
  @IsArray()
  @IsEnum(ContactType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  contact_types?: ContactType[];
}
