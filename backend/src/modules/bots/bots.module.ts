import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotsService } from './services/bots.service';
import { BotsController } from './controllers/bots.controller';
import { Bot } from './entities/bot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bot])],
  controllers: [BotsController],
  providers: [BotsService],
  exports: [BotsService],
})
export class BotsModule {}
