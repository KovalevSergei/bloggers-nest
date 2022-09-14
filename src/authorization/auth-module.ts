import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from 'src/application/jwt-service';
import {
  ipSchema,
  IP_MODEL,
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from 'src/db';
import { EmailAdapter } from 'src/email/email-service';
import { UsersRepository } from 'src/users/users-repositorySQL';
import { UsersService } from 'src/users/users-service';
import { AuthController } from './auth-controller';
import { AuthService } from './auth-service';

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
  ],
  //exports: [BloggersRepository],
})
export class AuthModule {}
