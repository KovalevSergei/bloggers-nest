import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from 'src/application/jwt-service';
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
} from 'src/db';
import { PostsRepository } from 'src/posts/posts.repository';
import { UsersModule } from 'src/users/users-module';
import { UsersRepository } from 'src/users/users-repository';
import { UsersService } from 'src/users/users-service';

import { BloggersController } from './bloggers.controller';
import { BloggersRepository } from './bloggers.repository';
import { BloggersService } from './bloggers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BLOGGERS_COLLECTION, schema: bloggersSchema },
    ]),
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
    BloggersRepository,
    PostsRepository,
    JwtService,
    UsersService,
    UsersRepository,
  ],
  //exports: [BloggersRepository],
})
export class BloggersModule {}
