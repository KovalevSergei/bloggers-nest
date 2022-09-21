import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from 'src/application/jwt-service';
import { BloggersModule } from 'src/bloggers/bloggers.module';
import { BloggersRepository as BloggersMongooseRepository } from 'src/bloggers/bloggers.repository';
import { BloggersRepository as BloggersSQLRepository } from 'src/bloggers/bloggersSQL.repository';

import { CommentsRepository } from 'src/comments/comments-repository';

import {
  bloggersSchema,
  BLOGGERS_COLLECTION,
  commentsSchema,
  COMMENTS_COLLECTION,
  likeCommentsShema,
  likePostsShema,
  LIKE_COMMENTS_COLLECTION,
  LIKE_POSTS_COLLECTION,
  postsSchema,
  POSTS_COLLECTION,
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from 'src/db';
import { Bloggers, LikePosts, Posts } from 'src/db.sql';
//import { Bloggers, LikePosts, Posts } from 'src/db.sql';
import { UsersRepository as UsersRepositoryMongo } from 'src/users/users-repository';
import { UsersRepository as UsersRepositorySQL } from 'src/users/users-repositorySQL';
import { UsersService } from 'src/users/users-service';
import { PostsController } from './posts.controller';
import { PostsRepository as PostsRepositoryMongo } from './posts.repository';
import { PostsRepository as PostsRepositorySQL } from './posts.repositorySQL';
import { PostsService } from './posts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: POSTS_COLLECTION, schema: postsSchema },
    ]),
    TypeOrmModule.forFeature([Posts]),
    TypeOrmModule.forFeature([Bloggers]),
    TypeOrmModule.forFeature([LikePosts]),
    MongooseModule.forFeature([
      { name: LIKE_POSTS_COLLECTION, schema: likePostsShema },
    ]),
    MongooseModule.forFeature([
      { name: BLOGGERS_COLLECTION, schema: bloggersSchema },
    ]),
    MongooseModule.forFeature([
      { name: COMMENTS_COLLECTION, schema: commentsSchema },
    ]),
    MongooseModule.forFeature([
      { name: LIKE_COMMENTS_COLLECTION, schema: likeCommentsShema },
    ]),
    MongooseModule.forFeature([
      { name: USERS_COLLECTION, schema: usersSchema },
    ]),
    MongooseModule.forFeature([
      { name: TOKEN_COLLECTION, schema: tokenSchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepositoryMongo,
    BloggersMongooseRepository,
    BloggersSQLRepository,
    CommentsRepository,
    PostsRepositorySQL,
    UsersRepositoryMongo,
    UsersRepositorySQL,
    JwtService,
    UsersService,
  ],
})
export class PostsModule {}
