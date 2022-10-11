import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Req,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtService } from '../application/jwt-service';
import { UsersService } from '../users/users-service';
import { UsersDBTypeWithId } from '../users/users.type';
import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';
import { IRepositoryUsersQuery } from '../users/usersRepository.interface';
type RequestWithUser = Request & { user: UsersDBTypeWithId };

@Injectable()
export class Auth implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    @Inject('UsersRepositoryQuery')
    protected usersRepositoryQuery: IRepositoryUsersQuery,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //| Promise<boolean> | Observable<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      throw new UnauthorizedException();
    }
    const token = req.headers.authorization.split(' ')[1];

    const userId = await this.jwtService.getUserIdByToken(token);

    if (userId) {
      req.user = await this.usersRepositoryQuery.findUserById(userId);

      return true;
    }

    throw new UnauthorizedException();
  }

  /* if (authHeader === encode) {
        return true;
      }
      throw new UnauthorizedException();
    } */
}
