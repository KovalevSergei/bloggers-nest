import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from 'src/db';
import { Token, Users } from 'src/db.sql';
import { UsersController } from './users-controller';
import { UsersRepository as UsersRepositoryMongo } from './users-repository';
import { UsersRepository as UsersRepositorySQL } from './users-repositorySQL';
import { UsersService } from './users-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    TypeOrmModule.forFeature([Token]),
    MongooseModule.forFeature([
      { name: USERS_COLLECTION, schema: usersSchema },
    ]),
    MongooseModule.forFeature([
      { name: TOKEN_COLLECTION, schema: tokenSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepositoryMongo, UsersRepositorySQL],
  exports: [],
})
export class UsersModule {}
