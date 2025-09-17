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
import { ServersService } from '../services/servers.service';
import { CreateServerDto } from '../dto/create-server.dto';
import { UpdateServerDto } from '../dto/update-server.dto';
import { FindAllServersDto } from '../dto/find-all-servers.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { Server } from '../entities/server.entity';

@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Post()
  create(@Body() createServerDto: CreateServerDto): Promise<Server> {
    return this.serversService.create(createServerDto);
  }

  @Get()
  findAll(
    @Query() queryDto: FindAllServersDto,
  ): Promise<PaginationResponseDto> {
    return this.serversService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Server> {
    return this.serversService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServerDto: UpdateServerDto,
  ): Promise<Server> {
    return this.serversService.update(id, updateServerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.serversService.remove(id);
  }
}
