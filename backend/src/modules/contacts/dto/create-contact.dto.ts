import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ContactType } from '../../../common/enums/contact-type.enum';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  external_id: string;

  @IsString()
  @IsOptional()
  @Length(1, 150)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  phone_number?: string;

  @IsString()
  @IsOptional()
  @Length(0, 5000)
  notes?: string;

  @IsBoolean()
  @IsOptional()
  accepts_remarketing?: boolean;

  @IsEnum(ContactType)
  @IsOptional()
  contact_type?: ContactType = ContactType.ADS;
}
