import { Injectable } from '@nestjs/common';
import { UsersDBType, UsersDBTypeWithId } from './users.type';
import { ObjectId } from 'mongodb';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Token, Users } from '../db.sql';
interface usersReturn {
  items: UsersDBType[];
  totalCount: number;
}
@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() public dataSource: DataSource) {}

  async createUser(newUser: UsersDBType): Promise<UsersDBType> {
    const createUser = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Users)
      .values({
        id: newUser.id,
        login: newUser.accountData.login,
        email: newUser.accountData.email,
        passwordHash: newUser.accountData.passwordHash,
        passwordSalt: newUser.accountData.passwordSalt,
        createdAt: newUser.accountData.createdAt,
        confirmationCode: newUser.emailConfirmation.confirmationCode,
        expirationDate: newUser.emailConfirmation.expirationDate,
        isConfirmed: newUser.emailConfirmation.isConfirmed,
      })
      .execute();

    return newUser;
  }
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
  async deleteUsersId(id: string): Promise<boolean> {
    const user = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Users)
      .where('users.id=:id', { id })
      .execute();

    return user.raw === 1;
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
  async updateConfirmation(id: string) {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ isConfirmed: true })
      .where('users.id=:id', { id })
      .execute();
    return result.affected === 1;
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

  async updateCode(id: string, code: string) {
    const user = await this.dataSource
      .createQueryBuilder()
      .update(Users)
      .set({ confirmationCode: code })
      .where('user.id=:id', { id })
      .execute();

    return user.affected === 1;
  }
  async refreshTokenSave(token: string) {
    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Token)
      .values({ token: token })
      .execute();
    return token;
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
  async refreshTokenKill(token: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Token)
      .where('token.token=:token', { token })
      .execute();

    return result.affected === 1;
  }
}
