import { Injectable } from '@nestjs/common';
import { UsersDBType } from './users.type';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IRepositoryUsers } from './usersRepository.interface';
interface usersReturn {
  items: UsersDBType[];
  totalCount: number;
}
@Injectable()
export class UsersRepositoryNative implements IRepositoryUsers {
  constructor(@InjectDataSource('Native') public dataSource: DataSource) {}

  async createUser(newUser: UsersDBType): Promise<UsersDBType> {
    const createUser = await this.dataSource.query(
      `INSERT INTO users (
        id,
        login,
        email,
        "passwordHash",
    "passwordSalt",
    "createdAt",
    "confirmationCode",
    "expirationDate",
    "isConfirmed") 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        newUser.id,
        newUser.accountData.login,
        newUser.accountData.email,
        newUser.accountData.passwordHash,
        newUser.accountData.passwordSalt,
        newUser.accountData.createdAt,
        newUser.emailConfirmation.confirmationCode,
        newUser.emailConfirmation.expirationDate,
        newUser.emailConfirmation.isConfirmed,
      ],
    );

    return newUser;
  }

  async deleteUsersId(id: string): Promise<boolean> {
    const user = await this.dataSource.query(
      `SELECT * FROM "users" WHERE "id"=$1 `,
      [id],
    );
    if (user.length === 0) {
      return false;
    }

    const result = await this.dataSource.query(
      `DELETE FROM "users" WHERE "id"=$1`,
      [id],
    );
    return true;
  }

  async updateConfirmation(id: string) {
    const users = await this.dataSource.query(
      `SELECT * FROM "users" WHERE "id"=$1`,
      [id],
    );
    if (users.length === 0) {
      return false;
    }
    const result = await this.dataSource.query(
      `UPDATE "users" SET "isConfirmed"=$1 WHERE id=$2`,
      [true, id],
    );

    return true;
  }

  async updateCode(id: string, code: string) {
    const user = await this.dataSource.query(
      `SELECT * FROM "users" WHERE "id"=$1`,
      [id],
    );
    if (user.length === 0) {
      return false;
    }
    await this.dataSource.query(
      `UPDATE FROM "users" SET "confirmationCode"=$1`,
      [code],
    );
    return true;
  }
  async refreshTokenSave(token: string) {
    const result = await this.dataSource.query(
      `INSERT INTO "token"(token) VALUES($1)`,
      [token],
    );
    return true;
  }

  async refreshTokenKill(token: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT * FROM "token" WHERE token=$1`,
      [token],
    );
    if (result.length === 0) {
      return false;
    }
    await this.dataSource.query(`DELETE FROM "token" WHERE "token"=$1`, [
      token,
    ]);
    return true;
  }
}
