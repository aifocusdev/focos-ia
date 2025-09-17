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
import { BotsService } from '../services/bots.service';
import { CreateBotDto } from '../dto/create-bot.dto';
import { UpdateBotDto } from '../dto/update-bot.dto';
import { FindAllBotsDto } from '../dto/find-all-bots.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { Bot } from '../entities/bot.entity';

@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Post()
  create(@Body() createBotDto: CreateBotDto): Promise<Bot> {
    return this.botsService.create(createBotDto);
  }

  @Get()
  findAll(@Query() queryDto: FindAllBotsDto): Promise<PaginationResponseDto> {
    return this.botsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Bot> {
    return this.botsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBotDto: UpdateBotDto,
  ): Promise<Bot> {
    return this.botsService.update(id, updateBotDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.botsService.remove(id);
  }
}
