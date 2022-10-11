import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users-repositorySQL';
import { UsersDBType, UsersDBTypeWithId, usersGetDBType } from '../users.type';
//import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { compareAsc, format, add } from 'date-fns';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users-service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IRepositoryUsers } from '../usersRepository.interface';
export class CreateUserCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {}
}
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject('UsersRepository') protected usersRepository: IRepositoryUsers,
    protected usersService: UsersService,
  ) {}
  async execute(command: CreateUserCommand): Promise<UsersDBType> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.usersService._generateHash(
      command.password,
      passwordSalt,
    );

    const newUser: UsersDBType = {
      id: Number(new Date()).toString(),
      accountData: {
        login: command.login,
        email: command.email,
        passwordHash,
        passwordSalt,
        createdAt: new Date(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
        isConfirmed: false,
      },
    };

    const User = await this.usersRepository.createUser(newUser);

    return User;
  }
}
