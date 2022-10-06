import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositoryQuery } from '../../users/users-repositoryMongoQuery';

import { JwtService } from '../../application/jwt-service';
export class RefreshTokenFindCommand {
  constructor(public token: string) {}
}

@CommandHandler(RefreshTokenFindCommand)
export class RefreshTokenFindUseCase
  implements ICommandHandler<RefreshTokenFindCommand>
{
  constructor(
    protected usersRepositoryQuery: UsersRepositoryQuery,
    protected jwtService: JwtService,
  ) {}
  async execute(command: RefreshTokenFindCommand): Promise<boolean> {
    let refreshTokenFind = await this.usersRepositoryQuery.refreshTokenFind(
      command.token,
    );
    if (refreshTokenFind === null) {
      return false;
    }
    let refreshTokenTimeOut = await this.jwtService.getUserIdByToken(
      command.token,
    );

    if (refreshTokenTimeOut === null) {
      return false;
    } else {
      return true;
    }
  }
}
