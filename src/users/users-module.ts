import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from '../db';
import { Token, Users } from '../db.sql';
import {
  UsersMongoOrSql,
  UsersMongoOrSqlQuery,
} from '../mongoOrSqlDataBase/usersMongoOrSql';
import { CreateUserUseCase } from './use-case/createUserUseCase';
import { DeleteUserUseCase } from './use-case/deleteUserUseCase';
//import { Token, Users } from '../db.sql';
import { UsersController } from './users-controller';
import { UsersRepositoryQuery } from './users-repositoryMongoQuery';
import { UsersRepository as UsersRepositoryMongo } from './users-repositorySQL';
//import { UsersRepository as UsersRepositorySQL } from './users-repositorySQL';
import { UsersService } from './users-service';
const useCase = [CreateUserUseCase, DeleteUserUseCase];
@Module({
  imports: [
    CqrsModule,
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
  providers: [
    {
      provide: 'UsersRepositoryQuery',
      useClass: UsersMongoOrSqlQuery(process.env.REPOSITORY),
    },
    {
      provide: 'UsersRepository',
      useClass: UsersMongoOrSql(process.env.REPOSITORY),
    },

    UsersService,

    ...useCase,
  ],
  exports: [],
})
export class UsersModule {}
