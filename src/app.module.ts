import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtService } from './application/jwt-service';
import { AuthModule } from './authorization/auth-module';
import { BloggersModule } from './bloggers/bloggers.module';
import { CommentsModule } from './comments/commetns-module';
import { DatabaseModule } from './database.module';
import {
  Bloggers,
  Comments,
  LikeComments,
  LikePosts,
  Posts,
  Token,
  Users,
} from './db.sql';
import { configForSwitch } from './mongoOrSqlDataBase/config.forswitch';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users-module';

@Module({
  imports: [
    configForSwitch,
    TypeOrmModule.forRoot({
      name: 'Native',
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'postgres2',
      entities: [],
      autoLoadEntities: false,
      synchronize: false,
      //  logging: ['query'],
    }),
    TypeOrmModule.forRoot({
      name: 'ORM',
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'postgres2',
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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost/nest'),
    BloggersModule,
    PostsModule,
    UsersModule,
    CommentsModule,
    TestingModule,
    AuthModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
