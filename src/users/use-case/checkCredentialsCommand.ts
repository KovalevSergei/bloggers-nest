import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../users-service';
import { UsersRepositoryQuery } from '../users-repositoryMongoQuery';
export class ChechCredentialCommand {
  constructor(public login: string, public password: string) {}
}
@CommandHandler(ChechCredentialCommand)
export class CheckCredentialUseCase
  implements ICommandHandler<ChechCredentialCommand>
{
  constructor(
    protected usersRepository: UsersRepositoryQuery,
    protected usersService: UsersService,
  ) {}
  async execute(command: ChechCredentialCommand) {
    const user = await this.usersRepository.FindUserLogin(command.login);
    if (!user) return false;
    const passwordHash = await this.usersService._generateHash(
      command.password,
      user.accountData.passwordSalt,
    );
    if (user.accountData.passwordHash !== passwordHash) {
      return false;
    }
    return user;
  }
}
