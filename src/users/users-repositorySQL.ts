import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TOKEN_COLLECTION, USERS_COLLECTION } from '../db';
import { UsersDBType, UsersDBTypeWithId, usersGetDBType } from './users.type';
import { ObjectId } from 'mongodb';
import { RefreshToken, refreshToken } from '../authorization/auth-type';
import { IRepositoryUsers } from './usersRepository.interface';
interface usersReturn {
  items: UsersDBType[];
  totalCount: number;
}
@Injectable()
export class UsersRepository implements IRepositoryUsers {
  constructor(
    @InjectModel(USERS_COLLECTION)
    private usersModel: Model<UsersDBType>,
    @InjectModel(TOKEN_COLLECTION)
    private tokenModel: Model<RefreshToken>,
  ) {}
  async createUser(newUser: UsersDBType): Promise<UsersDBType> {
    const createUser = await this.usersModel.insertMany({
      ...newUser,
      _id: new ObjectId(),
    });
    return newUser;
  }

  async deleteUsersId(id: string): Promise<boolean> {
    const result = await this.usersModel.deleteOne({ id: id });
    return result.deletedCount === 1;
  }

  async updateConfirmation(id: string): Promise<boolean> {
    const result = await this.usersModel.updateOne(
      { id },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return result.modifiedCount === 1;
  }

  async updateCode(id: string, code: string): Promise<boolean> {
    const result = await this.usersModel.updateOne(
      { id },
      { $set: { 'emailConfirmation.confirmationCode': code } },
    );
    return result.modifiedCount === 1;
  }
  async refreshTokenSave(token: string): Promise<boolean> {
    const result = await new this.tokenModel({
      token: token,
      _id: new ObjectId(),
    }).save();
    return true;
  }

  async refreshTokenKill(token: string): Promise<boolean> {
    const result = await this.tokenModel.deleteOne({ token: token });
    return result.deletedCount === 1;
  }
}
