import { EmailAdapter } from '../../email/email-service';
import { UsersRepository } from '../../users/users-repositorySQL';
import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositoryQuery } from '../../users/users-repositoryMongoQuery';
import { UsersService } from '../../users/users-service';
export class ConfirmEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailCommandUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    protected usersRepositoryQuery: UsersRepositoryQuery,
    protected usersRepository: UsersRepository,
    protected usersService: UsersService,
    protected emailAdapter: EmailAdapter,
  ) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    let user = await this.usersRepositoryQuery.findByEmail(command.email);

    if (!user) return false;
    const id = user.id;
    const code = uuidv4();
    await this.usersRepository.updateCode(id, code);
    this.emailAdapter.sendEmail(command.email, 'email', code);

    return true;
  }
}
