import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersDBTypeWithId } from '../users/users.type';

import { UsersRepository } from '../users/users-repositorySQL';
import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';
import { IRepositoryUsersQuery } from '../users/usersRepository.interface';
type RequestWithUser = Request & { user: UsersDBTypeWithId };
@Injectable()
export class MailFindDoublicate implements CanActivate {
  constructor(
    @Inject('UsersRepositoryQuery')
    protected usersRepositoryQuery: IRepositoryUsersQuery,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    const mailFind = await this.usersRepositoryQuery.findByEmail(
      req.body.email,
    );
    if (mailFind) {
      throw new HttpException(
        { errorsMessages: [{ message: 'mail is used', field: 'email' }] },
        400,
      );
    }
    return true;
  }
}
