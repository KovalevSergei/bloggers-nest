import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, isEmail, IsNotEmpty, Length } from 'class-validator';

import { AuthBasic } from '../guards/authBasic.guards';
import { LoginFindDoublicate } from '../guards/loginFindDoublicate';
import { MailFindDoublicate } from '../guards/mailFindDoublicate';
import { CreateUserUseCase } from './use-case/createUserUseCase';
import { DeleteUserUseCase } from './use-case/deleteUserUseCase';
import { UsersService } from './users-service';
class CreateUser {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 10)
  login: string;
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20)
  password: string;
  @IsEmail()
  email: string;
}

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    private createUserUseCase: CreateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
  ) {}
  @UseGuards(AuthBasic)
  @UseGuards(MailFindDoublicate)
  @UseGuards(LoginFindDoublicate)
  @Post()
  @HttpCode(201)
  async createUser(@Body() body: CreateUser) {
    const login: string = body.login;
    const password: string = body.password;
    const email: string = body.email;

    const newUser = await this.createUserUseCase.execute(
      login,
      email,
      password,
    );

    const user = { id: newUser.id, login: newUser.accountData.login };
    return user;
  }
  @Get()
  async getUsers(
    @Query('PageNumber') PageNumber: number,
    @Query('PageSize') PageSize: number,
  ) {
    const getUsers = await this.usersService.getUsers(
      PageNumber || 1,
      PageSize || 10,
    );
    return getUsers;
  }
  @UseGuards(AuthBasic)
  @Delete(':id')
  @HttpCode(204)
  async deleteUserId(@Param('id') id: string) {
    const userDel = await this.deleteUserUseCase.execute(id);
    if (userDel) {
      return;
    } else {
      throw new NotFoundException('If specified user is not exists');
    }
  }
}
