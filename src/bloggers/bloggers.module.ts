import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  bloggersSchema,
  BLOGGERS_COLLECTION,
  postsSchema,
  POSTS_COLLECTION,
} from 'src/db';
import { PostsRepository } from 'src/posts/posts.repository';

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
  ],
  controllers: [BloggersController],
  providers: [BloggersService, BloggersRepository, PostsRepository],
  //exports: [BloggersRepository],
})
export class BloggersModule {}
