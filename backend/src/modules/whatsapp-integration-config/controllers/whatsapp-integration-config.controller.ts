import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { WhatsappIntegrationConfigService } from '../services/whatsapp-integration-config.service';
import { CreateWhatsappIntegrationConfigDto } from '../dto/create-whatsapp-integration-config.dto';
import { UpdateWhatsappIntegrationConfigDto } from '../dto/update-whatsapp-integration-config.dto';
import { FindAllWhatsappIntegrationConfigsDto } from '../dto/find-all-whatsapp-integration-configs.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/guards/roles.guard';

@Controller('whatsapp-integration-config')
@UseGuards(RolesGuard)
export class WhatsappIntegrationConfigController {
  constructor(
    private readonly configService: WhatsappIntegrationConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin')
  async create(@Body() createDto: CreateWhatsappIntegrationConfigDto) {
    return await this.configService.create(createDto);
  }

  @Get()
  @Roles('admin')
  async findAll(@Query() filters: FindAllWhatsappIntegrationConfigsDto) {
    return await this.configService.findAllWithPagination(filters);
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.configService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWhatsappIntegrationConfigDto,
  ) {
    return await this.configService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.configService.remove(id);
  }
}
