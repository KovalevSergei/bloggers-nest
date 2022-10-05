import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users/users-repositorySQL';
import { CommentsRepository } from '../comments-repositorySQL';
export class UpdateCommentCommand {
  constructor(public content: string, public commentId: string) {}
}
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
  ) {}
  async execute(
    command: UpdateCommentCommand,

    //userId: string
  ): Promise<boolean | null> {
    const UpdateComment = await this.commentsRepository.updateComment(
      command.content,
      command.commentId,
      //userId
    );
    return UpdateComment;
  }
}
