import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from '../db';
import { Token, Users } from '../db.sql';
import { CreateUserUseCase } from './use-case/createUserUseCase';
import { DeleteUserUseCase } from './use-case/deleteUserUseCase';
//import { Token, Users } from '../db.sql';
import { UsersController } from './users-controller';
import { UsersRepository as UsersRepositoryMongo } from './users-repositorySQL';
//import { UsersRepository as UsersRepositorySQL } from './users-repositorySQL';
import { UsersService } from './users-service';
const useCase = [CreateUserUseCase, DeleteUserUseCase];
@Module({
  imports: [
    //TypeOrmModule.forFeature([Users]),
    // TypeOrmModule.forFeature([Token]),
    MongooseModule.forFeature([
      { name: USERS_COLLECTION, schema: usersSchema },
    ]),
    MongooseModule.forFeature([
      { name: TOKEN_COLLECTION, schema: tokenSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepositoryMongo, ...useCase],
  exports: [],
})
export class UsersModule {}
