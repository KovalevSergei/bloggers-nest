import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggersModule } from './bloggers/bloggers.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest'), BloggersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
