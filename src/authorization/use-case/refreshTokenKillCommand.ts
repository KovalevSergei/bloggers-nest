import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../application/jwt-service';
import { UsersRepository } from '../../users/users-repositorySQL';
import { IRepositoryUsers } from '../../users/usersRepository.interface';
export class RefreshTokenKillCommand {
  constructor(public token: string) {}
}

@CommandHandler(RefreshTokenKillCommand)
export class RefreshTokenKillUseCase
  implements ICommandHandler<RefreshTokenKillCommand>
{
  constructor(
    @Inject('UsersRepository') protected usersRepository: IRepositoryUsers,
    protected jwtService: JwtService,
  ) {}
  async execute(command: RefreshTokenKillCommand): Promise<boolean> {
    let result = await this.usersRepository.refreshTokenKill(command.token);
    if (result === false) {
      return false;
    } else {
      return true;
    }
  }
}
