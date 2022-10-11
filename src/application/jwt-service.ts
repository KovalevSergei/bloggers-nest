import { UsersDBType } from '../users/users.type';
import * as jwt from 'jsonwebtoken';
import { settings } from '../setting';
import { UsersRepository } from '../users/users-repositorySQL';
import { Inject, Injectable } from '@nestjs/common';
import { IRepositoryUsers } from '../users/usersRepository.interface';
@Injectable()
export class JwtService {
  constructor(
    @Inject('UsersRepository') protected usersRepository: IRepositoryUsers,
  ) {}
  async createJWT(user: UsersDBType) {
    const token = jwt.sign({ userId: user.id }, settings.JWT_SECRET, {
      expiresIn: '66660000000s',
    });
    return token;
  }

  async createJWTrefresh(user: UsersDBType) {
    const tokenRefresh = jwt.sign({ userId: user.id }, settings.JWT_SECRET, {
      expiresIn: '70000000s',
    });
    await this.usersRepository.refreshTokenSave(tokenRefresh);

    return tokenRefresh;
  }

  async getUserIdByToken(token: string) {
    try {
      const result: any = jwt.verify(token, settings.JWT_SECRET);
      return result.userId;
    } catch (error) {
      return null;
    }
  }
}
