import { Injectable } from '@nestjs/common';
import { UsersDBType, UsersDBTypeWithId } from './users.type';
import { ObjectId } from 'mongodb';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Token, Users } from '../db.sql';
import { IRepositoryUsers } from './usersRepository.interface';
interface usersReturn {
  items: UsersDBType[];
  totalCount: number;
}
@Injectable()
export class UsersRepositorySql implements IRepositoryUsers {
  constructor(@InjectDataSource('ORM') public dataSource: DataSource) {}

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

  async deleteUsersId(id: string): Promise<boolean> {
    const user = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Users)
      .where('users.id=:id', { id })
      .execute();

    return user.raw === 1;
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
    return true;
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
