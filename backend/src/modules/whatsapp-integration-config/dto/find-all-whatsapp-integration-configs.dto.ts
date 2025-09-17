import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllWhatsappIntegrationConfigsDto {
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
  phone_number_id?: string;

  @IsOptional()
  @IsString()
  business_account_id?: string;

  @IsOptional()
  @IsString()
  api_version?: string;
}
