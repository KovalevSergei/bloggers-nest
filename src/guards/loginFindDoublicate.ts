import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersDBTypeWithId } from '../users/users.type';

import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';
type RequestWithUser = Request & { user: UsersDBTypeWithId };
@Injectable()
export class LoginFindDoublicate implements CanActivate {
  constructor(protected usersRepositoryQuery: UsersRepositoryQuery) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    const mailFind = await this.usersRepositoryQuery.FindUserLogin(
      req.body.login,
    );
    if (mailFind) {
      throw new HttpException(
        { errorsMessages: [{ message: 'login is used', field: 'login' }] },
        400,
      );
    }
    return true;
  }
}
