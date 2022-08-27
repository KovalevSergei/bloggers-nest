import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UsersDBTypeWithId } from 'src/users/users.type';
import { JwtService } from 'src/application/jwt-service';
import { UsersService } from 'src/users/users-service';
type RequestWithUser = Request & { user: UsersDBTypeWithId };
@Injectable()
export class UserId implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      req.user = null;
      console.log(req.user);
      return true;
    }
    const token = req.headers.authorization?.split(' ')[1];
    const a = token;
    const userId = await this.jwtService.getUserIdByToken(a);

    if (userId) {
      //const usersService = new UsersService(new UsersRepository());
      req.user = await this.usersService.findUserById(userId);

      return true;
    }

    return true;
  }
}
