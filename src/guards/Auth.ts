import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtService } from 'src/application/jwt-service';
import { UsersService } from 'src/users/users-service';
import { UsersDBTypeWithId } from 'src/users/users.type';
type RequestWithUser = Request & { user: UsersDBTypeWithId };

@Injectable()
export class Auth implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //| Promise<boolean> | Observable<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      throw new UnauthorizedException();
    }
    const token = req.headers.authorization?.split(' ')[1];

    const userId = await this.jwtService.getUserIdByToken(token);

    if (userId) {
      req.user = await this.usersService.findUserById(userId);

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
