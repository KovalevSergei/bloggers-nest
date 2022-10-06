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
import { CqrsModule } from '@nestjs/cqrs';
import { CheckCredentialUseCase } from '../users/use-case/checkCredentialsCommand';
import { ConfirmEmailCommandUseCase } from './use-case/confirmEmailCommand';
import { ConfirmCodeUseCase } from './use-case/confirmCode2Command';
import { RefreshTokenFindUseCase } from './use-case/refreshTokenFinCommand';
import { RefreshTokenKillUseCase } from './use-case/refreshTokenKillCommand';
import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';

const useCase = [
  CreateUserUseCase,
  CheckCredentialUseCase,
  ConfirmEmailCommandUseCase,
  ConfirmCodeUseCase,
  RefreshTokenFindUseCase,
  RefreshTokenKillUseCase,
  ConfirmCodeUseCase,
];
@Module({
  imports: [
    CqrsModule,
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
    UsersRepositoryQuery,
    ...useCase,
    //CommandBus,
  ],
  //exports: [BloggersRepository],
})
export class AuthModule {}
