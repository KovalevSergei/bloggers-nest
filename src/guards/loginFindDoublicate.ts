import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersDBTypeWithId } from 'src/users/users.type';

import { UsersRepository } from 'src/users/users-repository';
type RequestWithUser = Request & { user: UsersDBTypeWithId };
@Injectable()
export class LoginFindDoublicate implements CanActivate {
  constructor(protected usersRepository: UsersRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    const mailFind = await this.usersRepository.findLogin(req.body.login);
    if (mailFind) {
      throw new HttpException(
        { errorsMessages: [{ message: 'login is used', field: 'login' }] },
        400,
      );
    }
    return true;
  }
}