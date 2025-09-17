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
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from '../services/contacts.service';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { FindAllContactsDto } from '../dto/find-all-contacts.dto';
import { AddTagsToContactDto } from '../dto/add-tags-to-contact.dto';
import { RemoveTagsFromContactDto } from '../dto/remove-tags-from-contact.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/guards/roles.guard';

@Controller('contacts')
@UseGuards(RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @Roles('admin')
  async findAll(@Query() filters: FindAllContactsDto) {
    return await this.contactsService.findAllWithPagination(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.contactsService.findOne(id);
  }

  @Get('external-id/:external_id')
  async findByExternalId(@Param('external_id') external_id: string) {
    return await this.contactsService.findByExternalId(external_id);
  }
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return await this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.contactsService.remove(id);
  }

  @Post(':id/tags')
  async addTagsToContact(
    @Param('id', ParseIntPipe) id: number,
    @Body() addTagsDto: AddTagsToContactDto,
  ) {
    return await this.contactsService.addTagsToContact(id, addTagsDto);
  }

  @Delete(':id/tags')
  @HttpCode(HttpStatus.OK)
  async removeTagsFromContact(
    @Param('id', ParseIntPipe) id: number,
    @Body() removeTagsDto: RemoveTagsFromContactDto,
  ) {
    return await this.contactsService.removeTagsFromContact(id, removeTagsDto);
  }

  @Get(':id/tags')
  async getContactTags(@Param('id', ParseIntPipe) id: number) {
    return await this.contactsService.getContactTags(id);
  }

  @Get('by-tag/:tagId')
  async findContactsByTag(@Param('tagId', ParseIntPipe) tagId: number) {
    return await this.contactsService.findContactsByTag(tagId);
  }
}
