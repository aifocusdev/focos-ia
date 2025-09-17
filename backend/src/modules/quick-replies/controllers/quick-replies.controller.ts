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
import { QuickRepliesService } from '../services/quick-replies.service';
import { CreateQuickReplyDto } from '../dto/create-quick-reply.dto';
import { UpdateQuickReplyDto } from '../dto/update-quick-reply.dto';
import { FindAllQuickRepliesDto } from '../dto/find-all-quick-replies.dto';
import { QuickReplyPaginationResponseDto } from '../dto/pagination-response.dto';
import { QuickReply } from '../entities/quick-reply.entity';

@Controller('quick-replies')
export class QuickRepliesController {
  constructor(private readonly quickRepliesService: QuickRepliesService) {}

  @Post()
  create(
    @Body() createQuickReplyDto: CreateQuickReplyDto,
  ): Promise<QuickReply> {
    return this.quickRepliesService.create(createQuickReplyDto);
  }

  @Get()
  findAll(
    @Query() queryDto: FindAllQuickRepliesDto,
  ): Promise<QuickReplyPaginationResponseDto> {
    return this.quickRepliesService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<QuickReply> {
    return this.quickRepliesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuickReplyDto: UpdateQuickReplyDto,
  ): Promise<QuickReply> {
    return this.quickRepliesService.update(id, updateQuickReplyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.quickRepliesService.remove(id);
  }
}
