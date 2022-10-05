import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users/users-repositorySQL';
import { CommentsRepository } from '../comments-repositorySQL';

export class DeleteCommentCommand {
  constructor(public id: string) {}
}
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
  ) {}
  async execute(command: DeleteCommentCommand): Promise<boolean | null> {
    const isdelete = await this.commentsRepository.deleteComment(command.id);
    return isdelete;
  }
}
