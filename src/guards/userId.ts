import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersDBTypeWithId } from '../users/users.type';
import { JwtService } from '../application/jwt-service';
import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';
import { IRepositoryUsersQuery } from '../users/usersRepository.interface';
type RequestWithUser = Request & { user: UsersDBTypeWithId };
@Injectable()
export class UserId implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    @Inject('UsersRepositoryQuery')
    protected usersRepositoryQuery: IRepositoryUsersQuery,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      req.user = null;

      return true;
    }
    const token = req.headers.authorization?.split(' ')[1];
    const a = token;
    const userId = await this.jwtService.getUserIdByToken(a);

    if (userId) {
      //const usersService = new UsersService(new UsersRepository());
      req.user = await this.usersRepositoryQuery.findUserById(userId);

      return true;
    }

    return true;
  }
}
