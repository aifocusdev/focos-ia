import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateContactUserAccountDto } from './create-contact-user-account.dto';

export class UpdateContactUserAccountDto extends PartialType(
  OmitType(CreateContactUserAccountDto, ['contact_id'] as const),
) {}
