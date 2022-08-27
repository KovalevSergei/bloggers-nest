import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from 'src/application/jwt-service';
import { BloggersModule } from 'src/bloggers/bloggers.module';
import { BloggersRepository } from 'src/bloggers/bloggers.repository';
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
import { UsersRepository } from 'src/users/users-repository';
import { UsersService } from 'src/users/users-service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: POSTS_COLLECTION, schema: postsSchema },
    ]),
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
    PostsRepository,
    BloggersRepository,
    CommentsRepository,
    UsersRepository,
    JwtService,
    UsersService,
    //CommentsService,
  ],
  // exports: [PostsRepository],
})
export class PostsModule {}
