import { BloggersRepository } from '../../bloggers/bloggersSQL.repository';
import { CommentsRepository } from '../../comments/comments-repositorySQL';
import { commentDBTypePagination } from '../../comments/comments.type';

import { PostsRepository } from '../posts.repositorySQL';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepositoryQuery } from '../../comments/comments-repositoryMongoQuery';
import { InjectConnection } from '@nestjs/mongoose';
import { Inject } from '@nestjs/common';
export class getCommentPostCommand {
  constructor(
    public pageSize: number,
    public pageNumber: number,
    public postId: string,
  ) {}
}
@CommandHandler(getCommentPostCommand)
export class getCommentPostUseCase
  implements ICommandHandler<getCommentPostCommand>
{
  constructor(
    @Inject('CommentsRepositoryQuery')
    protected commentsRepositoryQuery: CommentsRepositoryQuery,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(
    command: getCommentPostCommand,
  ): Promise<commentDBTypePagination | boolean> {
    const { items, totalCount } =
      await this.commentsRepositoryQuery.getCommentAll(
        command.pageSize,
        command.pageNumber,
        command.postId,
      );
    let pagesCount = Number(Math.ceil(totalCount / command.pageSize));
    const result: commentDBTypePagination = {
      pagesCount: pagesCount,
      page: command.pageNumber,
      pageSize: command.pageSize,
      totalCount: totalCount,
      items: items,
    };
    return result;
  }
}
