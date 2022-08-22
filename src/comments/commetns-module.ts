import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
import { UsersRepository } from 'src/users/users-repository';

import { CommentsController } from './comments-controller';
import { CommentsRepository } from './comments-repository';
import { CommentsService } from './comments-service';

@Module({
  imports: [
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
  providers: [CommentsService, CommentsRepository, UsersRepository],
  //exports: [],
})
export class CommentsModule {}
