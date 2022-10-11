import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectConnection } from '@nestjs/mongoose';
import { UsersRepository } from '../../users/users-repositorySQL';
import { CommentsRepository } from '../comments-repositorySQL';
import { IRepositoryComments } from './commentsRepository.interface';

export class DeleteCommentCommand {
  constructor(public id: string) {}
}
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    @Inject('CommentsRepository')
    protected commentsRepository: IRepositoryComments,
  ) {}
  async execute(command: DeleteCommentCommand): Promise<boolean | null> {
    const isdelete = await this.commentsRepository.deleteComment(command.id);
    return isdelete;
  }
}
