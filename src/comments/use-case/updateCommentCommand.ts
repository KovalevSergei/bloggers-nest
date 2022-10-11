import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectConnection } from '@nestjs/mongoose';
import { UsersRepository } from '../../users/users-repositorySQL';
import { CommentsRepository } from '../comments-repositorySQL';
import { IRepositoryComments } from './commentsRepository.interface';
export class UpdateCommentCommand {
  constructor(public content: string, public commentId: string) {}
}
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    @Inject('CommentsRepository')
    protected commentsRepository: IRepositoryComments,
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
