import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../users-service';
import { UsersRepositoryQuery } from '../users-repositoryMongoQuery';
import { InjectConnection } from '@nestjs/mongoose';
import { Inject } from '@nestjs/common';
import { IRepositoryUsersQuery } from '../usersRepository.interface';
export class ChechCredentialCommand {
  constructor(public login: string, public password: string) {}
}
@CommandHandler(ChechCredentialCommand)
export class CheckCredentialUseCase
  implements ICommandHandler<ChechCredentialCommand>
{
  constructor(
    @Inject('UsersRepositoryQuery')
    protected usersRepository: IRepositoryUsersQuery,
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
