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
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { FindAllMessagesDto } from '../dto/find-all-messages.dto';
import { MarkAsReadDto } from '../dto/mark-as-read.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import {
  CursorPaginationDto,
  CursorPaginationResponse,
} from '../dto/cursor-pagination.dto';
import { SendMessageWithMediaDto } from '../dto/send-message-with-media.dto';
import { Message } from '../entities/message.entity';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() currentUser: User,
  ): Promise<Message> {
    return this.messagesService.create(createMessageDto, currentUser);
  }

  @Get()
  findAll(
    @Query() queryDto: FindAllMessagesDto,
  ): Promise<PaginationResponseDto> {
    return this.messagesService.findAll(queryDto);
  }

  @Get('conversation/:conversationId')
  findByConversation(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ): Promise<PaginationResponseDto> {
    return this.messagesService.findByConversation(conversationId, page, limit);
  }

  @Get('unread-count')
  getUnreadCount(
    @Query('conversationId', ParseIntPipe) conversationId?: number,
  ): Promise<number> {
    return this.messagesService.getUnreadCount(conversationId);
  }

  @Get('conversation/:conversationId/unread-contact')
  getUnreadContactMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ): Promise<Message[]> {
    return this.messagesService.getUnreadContactMessages(conversationId);
  }

  @Get('conversation/:conversationId/unread-agent')
  getUnreadAgentMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ): Promise<Message[]> {
    return this.messagesService.getUnreadAgentMessages(conversationId);
  }

  @Get('conversation/:conversationId/cursor')
  findByConversationCursor(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query() paginationDto: CursorPaginationDto,
  ): Promise<CursorPaginationResponse<Message>> {
    return this.messagesService.findByConversationCursor(
      conversationId,
      paginationDto,
    );
  }

  @Get('conversation/:conversationId/search')
  searchInConversation(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query('q') searchTerm: string,
    @Query() paginationDto: CursorPaginationDto,
  ): Promise<CursorPaginationResponse<Message>> {
    return this.messagesService.searchInConversation(
      conversationId,
      searchTerm,
      paginationDto,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Message> {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Patch('mark-as-read')
  markAsRead(@Body() markAsReadDto: MarkAsReadDto): Promise<void> {
    return this.messagesService.markAsRead(markAsReadDto);
  }

  @Patch('conversation/:conversationId/mark-as-read')
  markConversationAsRead(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ): Promise<void> {
    return this.messagesService.markConversationAsRead(conversationId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.messagesService.remove(id);
  }

  @Post('send-with-media/:conversationId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async sendMessageWithMedia(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body() sendMessageWithMediaDto: SendMessageWithMediaDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() currentUser: User,
  ): Promise<Message> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    return this.messagesService.sendMessageWithMedia(
      conversationId,
      sendMessageWithMediaDto,
      files,
      currentUser,
    );
  }
}
