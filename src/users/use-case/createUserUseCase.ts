import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users-repositorySQL';
import { UsersDBType, UsersDBTypeWithId, usersGetDBType } from '../users.type';
//import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { compareAsc, format, add } from 'date-fns';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users-service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersService: UsersService,
  ) {}
  async execute(
    login: string,
    email: string,
    password: string,
  ): Promise<UsersDBType> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.usersService._generateHash(
      password,
      passwordSalt,
    );

    const newUser: UsersDBType = {
      id: Number(new Date()).toString(),
      accountData: {
        login: login,
        email: email,
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
