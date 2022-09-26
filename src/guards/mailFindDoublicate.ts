import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersDBTypeWithId } from '../users/users.type';

import { UsersRepository } from '../users/users-repositorySQL';
type RequestWithUser = Request & { user: UsersDBTypeWithId };
@Injectable()
export class MailFindDoublicate implements CanActivate {
  constructor(protected usersRepository: UsersRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    const mailFind = await this.usersRepository.findByEmail(req.body.email);
    if (mailFind) {
      throw new HttpException(
        { errorsMessages: [{ message: 'mail is used', field: 'email' }] },
        400,
      );
    }
    return true;
  }
}
