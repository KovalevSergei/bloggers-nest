import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../application/jwt-service';
import { UsersRepository } from '../../users/users-repositorySQL';
export class RefreshTokenKillCommand {
  constructor(public token: string) {}
}

@CommandHandler(RefreshTokenKillCommand)
export class RefreshTokenKillUseCase
  implements ICommandHandler<RefreshTokenKillCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
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
