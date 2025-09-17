import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { N8NBotService } from './services/n8n-bot.service';
import { N8NLog } from './entities/n8n-log.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    ConfigModule,
    TypeOrmModule.forFeature([N8NLog]),
  ],
  providers: [N8NBotService],
  exports: [N8NBotService],
})
export class N8NBotModule {}
