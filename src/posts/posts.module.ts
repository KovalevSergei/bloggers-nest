import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '../application/jwt-service';
import { BloggersModule } from '../bloggers/bloggers.module';
import { BloggersRepository as BloggersMongooseRepository } from '../bloggers/bloggersSQL.repository';
//import { BloggersRepository as BloggersSQLRepository } from '../bloggers/bloggersSQL.repository';

import { CommentsRepository } from '../comments/comments-repositorySQL';

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
} from '../db';
import {
  Bloggers,
  LikeComments,
  LikePosts,
  Posts,
  Token,
  Users,
} from 'src/db.sql';
//import { Bloggers, LikePosts, Posts } from 'src/db.sql';
import { UsersRepository as UsersRepositoryMongo } from '../users/users-repositorySQL';
//import { UsersRepository as UsersRepositorySQL } from 'src/users/users-repositorySQL';
import { UsersService } from '../users/users-service';
import { PostsController } from './posts.controller';
import { PostsRepository as PostsRepositoryMongo } from './posts.repositorySQL';
import { PostsRepository as PostsRepositorySQL } from './posts.repositorySQL';
import { PostsService } from './posts.service';
import { CreatePostsUseCase } from './use-case/createPostsUseCase';
import { DeletePostsUseCase } from './use-case/deletePostsUseCase';
import { UpdatePostsUseCase } from './use-case/updatePostsUseCase';
import { CreateCommentsUseCase } from './use-case/createCommentsUseCase';
import { UpdateLikePostUseCase } from './use-case/updateLikePostUseCase';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPostUseCase } from './use-case/getPostsUseCese';
import { PostsRepositoryQuery } from './posts.repositoryMongoQuery';
import { getCommentPostUseCase } from './use-case/getCommentsPostUseCase';
import { BloggersRepositoryQuery } from '../bloggers/bloggers.repositoryQueryMongo';
import { CommentsRepositoryQuery } from '../comments/comments-repositoryMongoQuery';
import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';
import {
  UsersMongoOrSql,
  UsersMongoOrSqlQuery,
} from '../mongoOrSqlDataBase/usersMongoOrSql';
import {
  PostsMongoOrSql,
  PostsMongoOrSqlQuery,
} from '../mongoOrSqlDataBase/postsMongoOrSql';
import {
  BloggersMongoOrSql,
  BloggersMongoOrSqlQuery,
} from '../mongoOrSqlDataBase/bloggersMongoOrSql';
import {
  CommentsMongoOrSql,
  CommentsMongoOrSqlQuery,
} from '../mongoOrSqlDataBase/commentsMongoOrSql';
const useCase = [
  CreatePostsUseCase,
  DeletePostsUseCase,
  UpdatePostsUseCase,
  CreateCommentsUseCase,
  UpdateLikePostUseCase,
  GetPostUseCase,
  getCommentPostUseCase,
];
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: POSTS_COLLECTION, schema: postsSchema },
    ]),
    TypeOrmModule.forFeature(
      [Posts, Bloggers, LikePosts, Token, Users, LikeComments],
      'ORM',
    ),
    TypeOrmModule.forFeature([], 'Native'),

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
    {
      provide: 'BloggersRepository',
      useClass: BloggersMongoOrSql(process.env.REPOSITORY),
    },
    {
      provide: 'BloggersRepositoryQuery',
      useClass: BloggersMongoOrSqlQuery(process.env.REPOSITORY),
    },
    {
      provide: 'PostsRepositorу',
      useClass: PostsMongoOrSql(process.env.REPOSITORY),
    },
    {
      provide: 'PostsRepositoryQuery',
      useClass: PostsMongoOrSqlQuery(process.env.REPOSITORY),
    },
    {
      provide: 'UsersRepositoryQuery',
      useClass: UsersMongoOrSqlQuery(process.env.REPOSITORY),
    },
    {
      provide: 'UsersRepository',
      useClass: UsersMongoOrSql(process.env.REPOSITORY),
    },
    {
      provide: 'CommentsRepositoryQuery',
      useClass: CommentsMongoOrSqlQuery(process.env.REPOSITORY),
    },
    {
      provide: 'CommentsRepository',
      useClass: CommentsMongoOrSql(process.env.REPOSITORY),
    },
    PostsService,
    JwtService,
    UsersService,
    CommentsRepositoryQuery,

    ...useCase,
  ],
})
export class PostsModule {}
