import { Injectable } from '@nestjs/common';
import { UsersDBType, UsersDBTypeWithId } from './users.type';
import { ObjectId } from 'mongodb';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
interface usersReturn {
  items: UsersDBType[];
  totalCount: number;
}
@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() public dataSource: DataSource) {}

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
  async getUsers(PageSize: number, PageNumber: number): Promise<usersReturn> {
    const totalCount = await this.dataSource.query(
      `SELECT COUNT(id) FROM "users"`,
    );
    const users = await this.dataSource.query(
      `SELECT * FROM "users" LIMIT $1 OFFSET(($2-1)*$1)`,
      [PageSize, PageNumber],
    );
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
    return { totalCount: +totalCount[0].count, items: items };
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
  async userGetLogin(login: string): Promise<boolean> {
    const usersFind = await this.dataSource.query(
      `SELECT * FROM "users" WHERE "login"=$1`,
      [login],
    );
    if (usersFind.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  async FindUserLogin(login: string): Promise<UsersDBTypeWithId | null> {
    const users = await this.dataSource.query(
      `SELECT *FROM "users" WHERE "login"=$1`,
      [login],
    );
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
  async findUserById(id: string): Promise<UsersDBTypeWithId | null> {
    const users = await this.dataSource.query(
      `SELECT * FROM "users" WHERE "id"=$1`,
      [id],
    );
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
    const users = await this.dataSource.query(
      `SELECT * FROM "users" WHERE "id"=$1`,
      [id],
    );
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
  async findByConfirmationCode(code: string): Promise<UsersDBType | null> {
    const users = await this.dataSource.query(
      `SELECT * FROm "users" WHERE "confirmationCode"=$1`,
      [code],
    );

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
    const users = await this.dataSource.query(
      `SELECT * FROM users WHERE email=$1`,
      [email],
    );
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
    return token;
  }

  async refreshTokenFind(token: string): Promise<string | null> {
    const result = await this.dataSource.query(
      `SELECT * FROM "token" WHERE token=$1`,
      [token],
    );

    if (result.length === 0) {
      return null;
    }

    return result.token;
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
