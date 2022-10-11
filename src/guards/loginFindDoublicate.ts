import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersDBTypeWithId } from '../users/users.type';

import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';
import { IRepositoryUsersQuery } from '../users/usersRepository.interface';
type RequestWithUser = Request & { user: UsersDBTypeWithId };
@Injectable()
export class LoginFindDoublicate implements CanActivate {
  constructor(
    @Inject('UsersRepositoryQuery')
    protected usersRepositoryQuery: IRepositoryUsersQuery,
  ) {}
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
