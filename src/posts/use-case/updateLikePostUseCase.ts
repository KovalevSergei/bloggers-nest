import { Injectable } from '@nestjs/common';
import { BloggersRepository } from '../../bloggers/bloggersSQL.repository';
import { CommentsRepository } from '../../comments/comments-repositorySQL';
import {
  commentDBTypePagination,
  commentsDBPostIdType,
  commentsDBType2,
} from 'src/comments/comments.type';
import { Posts } from '../../db.sql';
import { UsersRepository } from '../../users/users-repositorySQL';
import { UsersDBType } from '../../users/users.type';
import { PostsRepository } from '../posts.repositorySQL';
import {
  likePosts,
  likePostWithId,
  postsDBType,
  postsType,
} from '../posts.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class UpdateLikePostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public status: string,
  ) {}
}
@CommandHandler(UpdateLikePostCommand)
export class UpdateLikePostUseCase
  implements ICommandHandler<UpdateLikePostCommand>
{
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(command: UpdateLikePostCommand): Promise<boolean> {
    const findLike = await this.postsRepository.findLikeStatus(
      command.postId,
      command.userId,
    );
    const login = await this.usersRepository.getUserById(command.userId);
    const login2 = login as UsersDBType;
    if (!findLike && command.status != 'None') {
      const likePostForm = new likePosts(
        command.postId,
        command.userId,
        login2.accountData.login,
        command.status,
        new Date(),
      );
      const result = await this.postsRepository.createLikeStatus(likePostForm);
      return true;
    }
    if (findLike && status === 'None') {
      await this.postsRepository.deleteLike(command.postId, command.userId);
      return true;
    }

    if (findLike?.myStatus === status) {
      return true;
    } else {
      await this.postsRepository.deleteLike(command.postId, command.userId);
      const login = await this.usersRepository.getUserById(command.userId);
      const login2 = login as UsersDBType;
      const likePostForm = new likePosts(
        command.postId,
        command.userId,
        login2.accountData.login,
        command.status,
        new Date(),
      );
      const result = await this.postsRepository.createLikeStatus(likePostForm);
    }
    return true;
  }
}
