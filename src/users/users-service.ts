import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users-repositorySQL';
import { UsersDBType, UsersDBTypeWithId, usersGetDBType } from './users.type';
//import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { compareAsc, format, add } from 'date-fns';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}
  // async createUser(
  //   login: string,
  //   email: string,
  //   password: string,
  // ): Promise<UsersDBType> {
  //   const passwordSalt = await bcrypt.genSalt(10);
  //   const passwordHash = await this._generateHash(password, passwordSalt);

  //   const newUser: UsersDBType = {
  //     id: Number(new Date()).toString(),
  //     accountData: {
  //       login: login,
  //       email: email,
  //       passwordHash,
  //       passwordSalt,
  //       createdAt: new Date(),
  //     },
  //     emailConfirmation: {
  //       confirmationCode: uuidv4(),
  //       expirationDate: add(new Date(), {
  //         hours: 1,
  //         minutes: 3,
  //       }),
  //       isConfirmed: false,
  //     },
  //   };

  //   const User = await this.usersRepository.createUser(newUser);

  //   return User;
  // }
  async _generateHash(password: string, salt: string) {
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async getUsers(
    PageNumber: number,
    PageSize: number,
  ): Promise<usersGetDBType> {
    const { items, totalCount } = await this.usersRepository.getUsers(
      PageSize,
      PageNumber,
    );

    //const userDtos = items.map(i => ({id: i.id,login:i.accountData.login}))
    const userRet = [];
    for (let i = 0; i < items.length; ++i) {
      const a = { id: items[i].id, login: items[i].accountData.login };
      userRet.push(a);
    }
    let pagesCount = Number(Math.ceil(totalCount / PageSize));
    const result: usersGetDBType = {
      pagesCount: pagesCount,
      page: PageNumber,
      pageSize: PageSize,
      totalCount: totalCount,
      items: userRet,
    };

    return result;
  }
  // async deleteUserId(id: string): Promise<boolean> {
  //   return this.usersRepository.deleteUsersId(id);
  // }
  async checkCredentials(
    users: UsersDBTypeWithId,
    login: string,
    password: string,
  ) {
    const user = await this.usersRepository.FindUserLogin(login);
    if (!user) return false;
    const passwordHash = await this._generateHash(
      password,
      user.accountData.passwordSalt,
    );
    if (user.accountData.passwordHash !== passwordHash) {
      return false;
    }
    return user;
  }
  async getUserByLogin(login: string) {
    return this.usersRepository.FindUserLogin(login);
  }

  async findUserById(id: string): Promise<UsersDBTypeWithId | null> {
    const result = await this.usersRepository.findUserById(id);
    return result;
  }

  async getUserById(id: string): Promise<UsersDBType | null> {
    const result = await this.usersRepository.getUserById(id);
    return result;
  }
}
