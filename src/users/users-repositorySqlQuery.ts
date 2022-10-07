import { Injectable } from '@nestjs/common';
import { UsersDBType, UsersDBTypeWithId } from './users.type';
import { ObjectId } from 'mongodb';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Token, Users } from '../db.sql';
import { IRepositoryUsersQuery } from './usersRepository.interface';
export interface usersReturn {
  items: UsersDBType[];
  totalCount: number;
}
@Injectable()
export class UsersRepositorySqlQuery implements IRepositoryUsersQuery {
  constructor(@InjectDataSource('ORM') public dataSource: DataSource) {}

  async getUsers(PageSize: number, PageNumber: number): Promise<usersReturn> {
    const totalCount = await this.dataSource
      .getRepository(Users)
      .createQueryBuilder('users')
      .getCount();
    const users = await this.dataSource
      .getRepository(Users)
      .createQueryBuilder('users')
      .limit(PageSize)
      .offset((PageNumber - 1) * PageSize)
      .getMany();
    const items = [];

    for (let i = 0; i < users.length; i++) {
      const a = {
        id: users[i].id,
        accountData: {
          login: users[i].login,
          email: users[i].email,
          passwordHash: users[i].passwordHash,
          passwordSalt: users[i].passwordSalt,
          createdAt: users[i].createdAt,
        },
        emailConfirmation: {
          confirmationCode: users[i].confirmationCode,
          expirationDate: users[i].expirationDate,
          isConfirmed: users[i].isConfirmed,
        },
      };
      items.push(a);
    }
    return { totalCount: totalCount, items: items };
  }

  async userGetLogin(login: string): Promise<boolean> {
    const usersFind = await this.dataSource
      .getRepository(Users)
      .createQueryBuilder('users')
      .select()
      .where('users.login=:login', { login })
      .getMany();

    if (usersFind.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  async FindUserLogin(login: string): Promise<UsersDBTypeWithId | null> {
    const users = await this.dataSource
      .getRepository(Users)
      .createQueryBuilder('users')
      .select()
      .where('users.login=:login', { login })
      .getMany();
    if (users.length === 0) {
      return null;
    }
    const result = {
      _id: new ObjectId(),
      id: users[0].id,
      accountData: {
        login: users[0].login,
        email: users[0].email,
        passwordHash: users[0].passwordHash,
        passwordSalt: users[0].passwordSalt,
        createdAt: users[0].createdAt,
      },
      emailConfirmation: {
        confirmationCode: users[0].confirmationCode,
        expirationDate: users[0].expirationDate,
        isConfirmed: users[0].isConfirmed,
      },
    };
    return result;
  }
  async findUserById(id: string): Promise<UsersDBTypeWithId | null> {
    const users = await this.dataSource
      .getRepository(Users)
      .createQueryBuilder('users')
      .select()
      .where('users.id=:id', { id })
      .getMany();

    if (users.length === 0) {
      return null;
    }
    const result: UsersDBTypeWithId = {
      _id: new ObjectId(),
      id: users[0].id,
      accountData: {
        login: users[0].login,
        email: users[0].email,
        passwordHash: users[0].passwordHash,
        passwordSalt: users[0].passwordSalt,
        createdAt: users[0].createdAt,
      },
      emailConfirmation: {
        confirmationCode: users[0].confirmationCode,
        expirationDate: users[0].expirationDate,
        isConfirmed: users[0].isConfirmed,
      },
    };

    return result;
  }
  async getUserById(id: string): Promise<UsersDBType | null> {
    const users = await this.dataSource
      .getRepository(Users)
      .createQueryBuilder('users')
      .select()
      .where('users.id=:id', { id })
      .getMany();
    if (users.length === 0) {
      return null;
    }
    const result: UsersDBType = {
      id: users[0].id,
      accountData: {
        login: users[0].login,
        email: users[0].email,
        passwordHash: users[0].passwordHash,
        passwordSalt: users[0].passwordSalt,
        createdAt: users[0].createdAt,
      },
      emailConfirmation: {
        confirmationCode: users[0].confirmationCode,
        expirationDate: users[0].expirationDate,
        isConfirmed: users[0].isConfirmed,
      },
    };

    return result;
  }

  async findByConfirmationCode(code: string): Promise<UsersDBType | null> {
    const users = await this.dataSource
      .getRepository(Users)
      .createQueryBuilder('users')
      .select()
      .where('users.confirmationCode=:code', { code })
      .getMany();
    if (users.length === 0) {
      return null;
    }
    const result: UsersDBType = {
      id: users[0].id,
      accountData: {
        login: users[0].login,
        email: users[0].email,
        passwordHash: users[0].passwordHash,
        passwordSalt: users[0].passwordSalt,
        createdAt: users[0].createdAt,
      },
      emailConfirmation: {
        confirmationCode: users[0].confirmationCode,
        expirationDate: users[0].expirationDate,
        isConfirmed: users[0].isConfirmed,
      },
    };

    return result;
  }
  async findByEmail(email: string): Promise<UsersDBType | null> {
    const users = await this.dataSource
      .getRepository(Users)
      .createQueryBuilder('users')
      .select()
      .where('users.email=:email', { email })
      .getMany();
    if (users.length === 0) {
      return null;
    }
    const result: UsersDBType = {
      id: users[0].id,
      accountData: {
        login: users[0].login,
        email: users[0].email,
        passwordHash: users[0].passwordHash,
        passwordSalt: users[0].passwordSalt,
        createdAt: users[0].createdAt,
      },
      emailConfirmation: {
        confirmationCode: users[0].confirmationCode,
        expirationDate: users[0].expirationDate,
        isConfirmed: users[0].isConfirmed,
      },
    };

    return result;
  }

  async refreshTokenFind(token: string): Promise<string | null> {
    const result = await this.dataSource
      .getRepository(Token)
      .createQueryBuilder('token')
      .select()
      .where('token.token=:token', { token })
      .getOne();
    if (result[0].length === 0) {
      return null;
    }

    return result.token;
  }
}
