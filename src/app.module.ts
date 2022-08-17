import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggersController } from './bloggers/bloggers.controller';
import { BloggersRepository } from './bloggers/bloggers.repository';
import { BloggersService } from './bloggers/bloggers.service';
import { databaseProviders } from './main';

@Module({
  imports: [],
  controllers: [AppController, BloggersController],
  providers: [AppService, BloggersService, BloggersRepository],
})
export class AppModule {}
