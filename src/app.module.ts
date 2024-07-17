import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HttpModule } from '@nestjs/axios';
import { GroqAiChatService } from './groqAi.service';
import { GeminiAi } from './geminiAi.service';
require('dotenv').config()

@Module({
  imports: [RedisModule.forRoot(
    {
      type: 'single',
      url: `${process.env.redisUrl}`
    }
  ), HttpModule],
  controllers: [AppController],
  providers: [AppService, GroqAiChatService, GeminiAi],
})
export class AppModule { }
