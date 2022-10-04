import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateUserUseCase } from '../users/use-case/createUserUseCase';

import { JwtService } from '../application/jwt-service';
import {
  ipSchema,
  IP_MODEL,
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from '../db';
import { EmailAdapter } from '../email/email-service';
import { UsersRepository } from '../users/users-repositorySQL';
import { UsersService } from '../users/users-service';
import { AuthController } from './auth-controller';
import { AuthService } from './auth-service';

const useCase = [CreateUserUseCase];
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: USERS_COLLECTION, schema: usersSchema },
    ]),
    MongooseModule.forFeature([
      { name: TOKEN_COLLECTION, schema: tokenSchema },
    ]),
    MongooseModule.forFeature([{ name: IP_MODEL, schema: ipSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    UsersRepository,
    UsersService,
    EmailAdapter,
    ...useCase,
    //CommandBus,
  ],
  //exports: [BloggersRepository],
})
export class AuthModule {}
