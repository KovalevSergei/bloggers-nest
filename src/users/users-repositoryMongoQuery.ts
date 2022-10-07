import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TOKEN_COLLECTION, USERS_COLLECTION } from '../db';
import { UsersDBType, UsersDBTypeWithId, usersGetDBType } from './users.type';
import { ObjectId } from 'mongodb';
import { RefreshToken, refreshToken } from '../authorization/auth-type';
import { IRepositoryUsersQuery } from './usersRepository.interface';
interface usersReturn {
  items: UsersDBType[];
  totalCount: number;
}
@Injectable()
export class UsersRepositoryQuery implements IRepositoryUsersQuery {
  constructor(
    @InjectModel(USERS_COLLECTION)
    private usersModel: Model<UsersDBType>,
    @InjectModel(TOKEN_COLLECTION)
    private tokenModel: Model<RefreshToken>,
  ) {}

  async getUsers(
    PageSize: number,
    PageNumber: number,
  ): Promise<usersGetDBType> {
    const totalCount = await this.usersModel.countDocuments();
    const items = await this.usersModel
      .find({}, { projection: { _id: 0, emailConfirmation: 0 } })
      .skip((PageNumber - 1) * PageSize)
      .limit(PageSize)
      .lean();

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

  async userGetLogin(login: string): Promise<boolean> {
    const usersFind = await this.usersModel.find({ login: login }).lean();

    if (usersFind.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  async FindUserLogin(login: string): Promise<UsersDBTypeWithId | null> {
    const usersFind = await this.usersModel.findOne({
      'accountData.login': login,
    });
    return usersFind;
  }
  async findUserById(id: string): Promise<UsersDBTypeWithId | null> {
    const usersFind = await this.usersModel.findOne({ id: id });
    return usersFind;
  }
  async getUserById(id: string): Promise<UsersDBTypeWithId | null> {
    const result = await this.usersModel.findOne(
      { id: id },
      { projection: { _id: 0 } },
    );
    return result;
  }

  async findByConfirmationCode(
    code: string,
  ): Promise<UsersDBTypeWithId | null> {
    const user = await this.usersModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    return user;
  }

  async findByEmail(email: string): Promise<UsersDBTypeWithId | null> {
    const user = await this.usersModel.findOne({
      'accountData.email': email,
    });
    return user;
  }

  async refreshTokenFind(token: string): Promise<string | null> {
    const result = await this.tokenModel.findOne({ token: token });

    if (!result || !result.token) {
      return null;
    }

    return result.token;
  }
}
