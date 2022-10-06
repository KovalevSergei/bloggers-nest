import { EmailAdapter } from '../../email/email-service';
import { UsersRepository } from '../../users/users-repositorySQL';
import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositoryQuery } from '../../users/users-repositoryMongoQuery';
import { UsersService } from '../../users/users-service';
import { UsersDBType } from '../../users/users.type';
export class ConfirmCodeCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmCodeCommand)
export class ConfirmCodeUseCase implements ICommandHandler<ConfirmCodeCommand> {
  constructor(
    protected usersRepositoryQuery: UsersRepositoryQuery,
    protected usersRepository: UsersRepository,
    protected usersService: UsersService,
    protected emailAdapter: EmailAdapter,
  ) {}
  async execute(command: ConfirmCodeCommand): Promise<UsersDBType | boolean> {
    let user = await this.usersRepository.findByConfirmationCode(command.code);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;

    return user;
  }
}
