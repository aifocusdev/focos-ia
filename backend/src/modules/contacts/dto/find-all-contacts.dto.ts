import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsArray,
  IsInt,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ContactType } from '../../../common/enums/contact-type.enum';

export class FindAllContactsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  external_id?: string;

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
  @Transform(({ value }) => String(value) === 'true')
  include_tags?: boolean;

  @IsOptional()
  @IsDateString()
  date_exp_from?: string;

  @IsOptional()
  @IsDateString()
  date_exp_to?: string;

  @IsOptional()
  @IsEnum(ContactType)
  contact_type?: ContactType;

  @IsOptional()
  @IsArray()
  @IsEnum(ContactType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  contact_types?: ContactType[];
}
