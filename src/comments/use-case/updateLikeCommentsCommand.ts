import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositoryQuery } from 'src/users/users-repositoryMongoQuery';
import { UsersRepository } from '../../users/users-repositorySQL';
import { UsersDBType } from '../../users/users.type';
import { CommentsRepository } from '../comments-repositorySQL';
import { likeComments } from '../comments.type';
export class UpdateLikeCommentsCommand {
  constructor(
    public commentsId: string,
    public userId: string,
    public myStatus: string,
  ) {}
}
@CommandHandler(UpdateLikeCommentsCommand)
export class UpdateLikeCommentsUseCase
  implements ICommandHandler<UpdateLikeCommentsCommand>
{
  constructor(
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
    protected usersRepositoryMongoQuery: UsersRepositoryQuery,
  ) {}
  async execute(command: UpdateLikeCommentsCommand): Promise<any> {
    const findLike = await this.commentsRepository.findLikeStatus(
      command.commentsId,
      command.userId,
    );
    const login = await this.usersRepositoryMongoQuery.getUserById(
      command.userId,
    );
    const login2 = login as UsersDBType;
    if (!findLike && command.myStatus != 'None') {
      const likeCommentForm = new likeComments(
        command.commentsId,
        command.userId,
        login2.accountData.login,
        command.myStatus,
        new Date(),
      );
      const result = await this.commentsRepository.createLikeStatus(
        likeCommentForm,
      );
      return true;
    }
    if (findLike && command.myStatus === 'None') {
      await this.commentsRepository.deleteLike(
        command.commentsId,
        command.userId,
      );
      return true;
    }

    if (findLike?.myStatus === command.myStatus) {
      return true;
    } else {
      await this.commentsRepository.deleteLike(
        command.commentsId,
        command.userId,
      );
      const login = await this.usersRepositoryMongoQuery.getUserById(
        command.userId,
      );
      const login2 = login as UsersDBType;
      const likeCommentForm = new likeComments(
        command.commentsId,
        command.userId,
        login2.accountData.login,
        command.myStatus,
        new Date(),
      );
      const result = await this.commentsRepository.createLikeStatus(
        likeCommentForm,
      );
    }

    return true;
  }
}
