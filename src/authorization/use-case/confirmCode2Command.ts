import { EmailAdapter } from '../../email/email-service';
import { UsersRepository } from '../../users/users-repositorySQL';
import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositoryQuery } from '../../users/users-repositoryMongoQuery';
import { UsersService } from '../../users/users-service';
import { UsersDBType } from '../../users/users.type';
import { InjectConnection } from '@nestjs/mongoose';
import { Inject } from '@nestjs/common';
import { IRepositoryUsersQuery } from '../../users/usersRepository.interface';
export class ConfirmCodeCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmCodeCommand)
export class ConfirmCodeUseCase implements ICommandHandler<ConfirmCodeCommand> {
  constructor(
    @Inject('UsersRepositoryQuery')
    protected usersRepositoryQuery: IRepositoryUsersQuery,
  ) {}
  async execute(command: ConfirmCodeCommand): Promise<UsersDBType | boolean> {
    let user = await this.usersRepositoryQuery.findByConfirmationCode(
      command.code,
    );
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;

    return user;
  }
}
