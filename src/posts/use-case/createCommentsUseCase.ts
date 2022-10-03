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
export class CreateCommentsUseCase {
  constructor(
    protected postsRepository: PostsRepository,
    protected bloggersRepository: BloggersRepository,
    protected commentsRepository: CommentsRepository,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(
    userId: string,
    userLogin: string,
    postId: string,
    content: string,
  ): Promise<commentsDBType2> {
    const commentNew: commentsDBPostIdType = {
      id: Number(new Date()).toString(),
      content: content,
      userId: userId,
      userLogin: userLogin,
      addedAt: new Date().toString(),
      postId: postId,
    };
    const result = await this.commentsRepository.createComment(commentNew);
    const result2 = {
      ...result,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
    return result2;
  }
}
