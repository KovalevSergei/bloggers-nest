import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';
import { JwtService } from '../application/jwt-service';
import {
  commentsSchema,
  COMMENTS_COLLECTION,
  likeCommentsShema,
  LIKE_COMMENTS_COLLECTION,
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from '../db';
import { Comments, LikeComments, Users } from '../db.sql';
//import { Comments, LikeComments, Users } from 'src/db.sql';
import { UsersRepository } from '../users/users-repositorySQL';
import { UsersService } from '../users/users-service';

import { CommentsController } from './comments-controller';
import { CommentsRepositoryQuery } from './comments-repositoryMongoQuery';
import { CommentsRepository } from './comments-repositorySQL';
import { CommentsService } from './comments-service';
import { DeleteCommentUseCase } from './use-case/deleteCommentCommand';
import { UpdateCommentUseCase } from './use-case/updateCommentCommand';
import { UpdateLikeCommentsUseCase } from './use-case/updateLikeCommentsCommand';
import {
  CommentsMongoOrSql,
  CommentsMongoOrSqlQuery,
} from '../mongoOrSqlDataBase/commentsMongoOrSql';
import { UsersMongoOrSqlQuery } from '../mongoOrSqlDataBase/usersMongoOrSql';
const useCase = [
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  UpdateLikeCommentsUseCase,
];
@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([], 'Native'),
    TypeOrmModule.forFeature([LikeComments, Comments, Users], 'ORM'),
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
  controllers: [CommentsController],
  providers: [
    {
      provide: 'UsersRepositoryQuery',
      useClass: UsersMongoOrSqlQuery(process.env.REPOSITORY),
    },
    {
      provide: 'UsersRepository',
      useClass: UsersMongoOrSqlQuery(process.env.REPOSITORY),
    },

    {
      provide: 'CommentsRepositoryQuery',
      useClass: CommentsMongoOrSqlQuery(process.env.REPOSITORY),
    },
    {
      provide: 'CommentsRepository',
      useClass: CommentsMongoOrSql(process.env.REPOSITORY),
    },
    CommentsService,
    UsersRepository,
    JwtService,
    UsersService,
    ...useCase,
  ],
  //exports: [],
})
export class CommentsModule {}
