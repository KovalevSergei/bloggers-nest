import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from 'src/db';
import { UsersController } from './users-controller';
import { UsersRepository } from './users-repository';
import { UsersService } from './users-service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: USERS_COLLECTION, schema: usersSchema },
    ]),
    MongooseModule.forFeature([
      { name: TOKEN_COLLECTION, schema: tokenSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [],
})
export class UsersModule {}
