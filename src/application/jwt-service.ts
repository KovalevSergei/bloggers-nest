import { UsersDBType } from 'src/users/users.type';
import * as jwt from 'jsonwebtoken';
import { settings } from 'src/setting';
import { UsersRepository } from 'src/users/users-repository';
import { Injectable } from '@nestjs/common';
@Injectable()
export class JwtService {
  constructor(protected usersRepository: UsersRepository) {}
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
