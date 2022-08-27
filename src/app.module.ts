import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './authorization/auth-module';
import { BloggersModule } from './bloggers/bloggers.module';
import { CommentsModule } from './comments/commetns-module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users-module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    BloggersModule,
    PostsModule,
    UsersModule,
    CommentsModule,
    TestingModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
