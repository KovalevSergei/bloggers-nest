import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './authorization/auth-module';
import { BloggersModule } from './bloggers/bloggers.module';
import { CommentsModule } from './comments/commetns-module';
import {
  Bloggers,
  Comments,
  LikeComments,
  LikePosts,
  Posts,
  Token,
  Users,
} from './db.sql';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users-module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'postgres',
      entities: [
        Posts,
        Bloggers,
        Users,
        Token,
        Comments,
        LikeComments,
        LikePosts,
      ],
      synchronize: false,
      //  logging: ['query'],
    }),
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
