import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class FindAllContactUserAccountsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  contact_id?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsInt()
  server_id?: number;

  @IsOptional()
  @IsString()
  username_search?: string;

  @IsOptional()
  @IsDateString()
  exp_before?: string;

  @IsOptional()
  @IsDateString()
  exp_after?: string;

  @IsOptional()
  @Transform(({ value }) => String(value) === 'true')
  expired_only?: boolean;

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
