import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from 'src/application/jwt-service';
import {
  tokenSchema,
  TOKEN_COLLECTION,
  usersSchema,
  USERS_COLLECTION,
} from 'src/db';
import { UsersRepository } from 'src/users/users-repository';
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
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, UsersRepository, UsersService],
  //exports: [BloggersRepository],
})
export class AuthModule {}
