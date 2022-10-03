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

@Injectable()
export class UpdateLikePostUseCase {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(
    postId: string,
    userId: string,
    status: string,
  ): Promise<boolean> {
    const findLike = await this.postsRepository.findLikeStatus(postId, userId);
    const login = await this.usersRepository.getUserById(userId);
    const login2 = login as UsersDBType;
    if (!findLike && status != 'None') {
      const likePostForm = new likePosts(
        postId,
        userId,
        login2.accountData.login,
        status,
        new Date(),
      );
      const result = await this.postsRepository.createLikeStatus(likePostForm);
      return true;
    }
    if (findLike && status === 'None') {
      await this.postsRepository.deleteLike(postId, userId);
      return true;
    }

    if (findLike?.myStatus === status) {
      return true;
    } else {
      await this.postsRepository.deleteLike(postId, userId);
      const login = await this.usersRepository.getUserById(userId);
      const login2 = login as UsersDBType;
      const likePostForm = new likePosts(
        postId,
        userId,
        login2.accountData.login,
        status,
        new Date(),
      );
      const result = await this.postsRepository.createLikeStatus(likePostForm);
    }
    return true;
  }
}
