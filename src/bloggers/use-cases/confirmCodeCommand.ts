import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectConnection } from '@nestjs/mongoose';
import { UsersRepositoryQuery } from '../../users/users-repositoryMongoQuery';
import { UsersRepository } from '../../users/users-repositorySQL';
import { UsersService } from '../../users/users-service';
import {
  IRepositoryUsers,
  IRepositoryUsersQuery,
} from '../../users/usersRepository.interface';

export class ConfirmCodeCommand {
  constructor(public code: string, public password: string) {}
}
@CommandHandler(ConfirmCodeCommand)
export class ConfirmCodeUseCase implements ICommandHandler<ConfirmCodeCommand> {
  constructor(
    @Inject('UsersRepository') protected usersRepository: IRepositoryUsers,
    @Inject('UsersRepositoryQuery')
    protected usersRepositoryQuery: IRepositoryUsersQuery,
  ) {}
  async execute(command: ConfirmCodeCommand): Promise<boolean> {
    let user = await this.usersRepositoryQuery.findByConfirmationCode(
      command.code,
    );
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;

    let result = await this.usersRepository.updateConfirmation(user.id); //подтвердить пользователя с таким айди

    return result;
  }
}
