import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '../application/jwt-service';
import {
  bloggersSchema,
  BLOGGERS_COLLECTION,
  ipSchema,
  IP_MODEL,
  postsSchema,
  POSTS_COLLECTION,
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from '../db';

import { PostsRepository } from '../posts/posts.repositorySQL';
import { UsersModule } from '../users/users-module';
import { UsersRepository } from '../users/users-repositorySQL';
import { UsersService } from '../users/users-service';

import { BloggersController } from './bloggers.controller';
import { BloggersRepository as BloggersMongooseRepository } from './bloggersSQL.repository';
//import { BloggersRepository as BloggersSQLRepository } from './bloggersSQL.repository';
import { BloggersService } from './bloggers.service';
import { Bloggers } from '../db.sql';
import { CreateBloggersUseCase } from './use-cases/createBloggerUseCase';
import { UpdateBloggersUseCase } from './use-cases/updateBloggerUseCase';
import { CreateBloggersPostUseCase } from './use-cases/createBloggerPostUseCase';
import { DeleteBloggersByIdUseCase } from './use-cases/deleteBloggersByIdUseCase';
import { BloggersRepositoryQuery } from './bloggers.repositoryQueryMongo';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { GetBloggersPostUseCase } from './use-cases/getBloggersPostsUseCase';
import { PostsRepositoryQuery } from '../posts/posts.repositoryMongoQuery';
import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';
import {
  BloggersMongoOrSql,
  BloggersMongoOrSqlQuery,
} from '../mongoOrSqlDataBase/bloggersMongoOrSql';
import {
  PostsMongoOrSql,
  PostsMongoOrSqlQuery,
} from '../mongoOrSqlDataBase/postsMongoOrSql';
import {
  UsersMongoOrSql,
  UsersMongoOrSqlQuery,
} from '../mongoOrSqlDataBase/usersMongoOrSql';

const useCases = [
  CreateBloggersUseCase,
  UpdateBloggersUseCase,
  CreateBloggersPostUseCase,
  DeleteBloggersByIdUseCase,
  CreateBloggersPostUseCase,
  GetBloggersPostUseCase,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: BLOGGERS_COLLECTION, schema: bloggersSchema },
    ]),
    //TypeOrmModule.forFeature([Bloggers]),
    MongooseModule.forFeature([
      { name: POSTS_COLLECTION, schema: postsSchema },
    ]),
    MongooseModule.forFeature([
      { name: USERS_COLLECTION, schema: usersSchema },
    ]),
    MongooseModule.forFeature([
      { name: TOKEN_COLLECTION, schema: tokenSchema },
    ]),
  ],
  controllers: [BloggersController],
  providers: [
    BloggersService,
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

    JwtService,
    UsersService,
    ...useCases,
  ],
  //exports: [BloggersRepository],
})
export class BloggersModule {}
