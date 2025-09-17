import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator';

export class CreateWhatsappIntegrationConfigDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  phone_number_id: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  business_account_id?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  api_version?: string = 'v16.0';
}
