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
} from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, isEmail, IsNotEmpty, Length } from 'class-validator';
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
  constructor(protected usersService: UsersService) {}
  @Post()
  @HttpCode(201)
  async createUser(@Body() body: CreateUser) {
    const login: string = body.login;
    const password: string = body.password;
    const email: string = body.email;
    const newUser = await this.usersService.createUser(login, email, password);

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
    console.log(getUsers);
    return getUsers;
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteUserId(@Param('id') id: string) {
    const userDel = await this.usersService.deleteUserId(id);
    if (userDel) {
      return;
    } else {
      throw new NotFoundException('If specified user is not exists');
    }
  }
}
