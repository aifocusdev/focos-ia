import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ContactUserAccountsService } from '../services/contact-user-accounts.service';
import { CreateContactUserAccountDto } from '../dto/create-contact-user-account.dto';
import { UpdateContactUserAccountDto } from '../dto/update-contact-user-account.dto';
import { FindAllContactUserAccountsDto } from '../dto/find-all-contact-user-accounts.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { ContactUserAccount } from '../entities/contact-user-account.entity';

@Controller('contact-user-accounts')
export class ContactUserAccountsController {
  constructor(
    private readonly contactUserAccountsService: ContactUserAccountsService,
  ) {}

  @Post()
  create(
    @Body() createContactUserAccountDto: CreateContactUserAccountDto,
  ): Promise<ContactUserAccount> {
    return this.contactUserAccountsService.create(createContactUserAccountDto);
  }

  @Get()
  findAll(
    @Query() queryDto: FindAllContactUserAccountsDto,
  ): Promise<PaginationResponseDto> {
    return this.contactUserAccountsService.findAll(queryDto);
  }
  @Get('contact/:contactId')
  findByContactId(
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<ContactUserAccount[]> {
    return this.contactUserAccountsService.findByContactId(contactId);
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ContactUserAccount> {
    return this.contactUserAccountsService.findOne(id);
  }
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactUserAccountDto: UpdateContactUserAccountDto,
  ): Promise<ContactUserAccount> {
    return this.contactUserAccountsService.update(
      id,
      updateContactUserAccountDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.contactUserAccountsService.remove(id);
  }
}
