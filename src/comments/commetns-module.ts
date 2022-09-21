import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from 'src/application/jwt-service';
import {
  commentsSchema,
  COMMENTS_COLLECTION,
  likeCommentsShema,
  LIKE_COMMENTS_COLLECTION,
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from 'src/db';
import { Comments, LikeComments } from 'src/db.sql';
//import { Comments, LikeComments, Users } from 'src/db.sql';
import { UsersRepository } from 'src/users/users-repositorySQL';
import { UsersService } from 'src/users/users-service';

import { CommentsController } from './comments-controller';
import { CommentsRepository } from './comments-repositorySQL';
import { CommentsService } from './comments-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comments]),
    TypeOrmModule.forFeature([LikeComments]),
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
    CommentsService,
    CommentsRepository,
    UsersRepository,
    JwtService,
    UsersService,
  ],
  //exports: [],
})
export class CommentsModule {}
