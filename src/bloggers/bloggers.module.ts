import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { bloggersSchema, BLOGGERS_COLLECTION } from 'src/db';
import { BloggersController } from './bloggers.controller';
import { BloggersRepository } from './bloggers.repository';
import { BloggersService } from './bloggers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BLOGGERS_COLLECTION, schema: bloggersSchema },
    ]),
  ],
  controllers: [BloggersController],
  providers: [BloggersService, BloggersRepository],
  exports: [],
})
export class BloggersModule {}
