import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ConversationsService } from '../services/conversations.service';
import { ConversationAutoAssignmentService } from '../services/conversation-auto-assignment.service';
import { FindAllConversationsDto } from '../dto/find-all-conversations.dto';
import { AssignConversationDto } from '../dto/assign-conversation.dto';
import { MarkConversationReadDto } from '../dto/mark-conversation-read.dto';
import { MarkConversationUnreadDto } from '../dto/mark-conversation-unread.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { Conversation } from '../entities/conversation.entity';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly autoAssignmentService: ConversationAutoAssignmentService,
  ) {}

  @Get()
  findAll(
    @Query() queryDto: FindAllConversationsDto,
    @CurrentUser() currentUser: User,
  ): Promise<PaginationResponseDto> {
    return this.conversationsService.findAll(queryDto, currentUser.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Conversation> {
    return this.conversationsService.findOne(id);
  }

  @Patch(':id/assign')
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignDto: AssignConversationDto,
    @CurrentUser() currentUser: User,
  ): Promise<Conversation> {
    return this.conversationsService.assign(id, assignDto, currentUser.id);
  }

  @Patch(':id/unassign')
  unassign(@Param('id', ParseIntPipe) id: number): Promise<Conversation> {
    return this.conversationsService.unassign(id);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Body() markReadDto: MarkConversationReadDto,
    @CurrentUser() currentUser: User,
  ): Promise<Conversation> {
    return this.conversationsService.markAsRead(id, currentUser.id);
  }

  @Patch(':id/unread')
  markAsUnread(
    @Param('id', ParseIntPipe) id: number,
    @Body() markUnreadDto: MarkConversationUnreadDto,
    @CurrentUser() currentUser: User,
  ): Promise<Conversation> {
    return this.conversationsService.markAsUnread(id, currentUser.id);
  }

  @Post('auto-assignment/execute')
  async executeAutoAssignment(): Promise<{
    processed: number;
    errors: number;
  }> {
    return this.autoAssignmentService.executeManualAutoAssignment();
  }
}
