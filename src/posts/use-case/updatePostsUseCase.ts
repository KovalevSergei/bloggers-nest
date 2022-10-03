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
export class UpdatePostsUseCase {
  constructor(
    protected postsRepository: PostsRepository,
    protected bloggersRepository: BloggersRepository,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    bloggerId: string,
  ): Promise<boolean | null> {
    const nameblog = await this.bloggersRepository.getBloggersById(bloggerId);

    if (!nameblog) {
      return null;
    } else {
      return await this.postsRepository.updatePostsId(
        id,
        title,
        shortDescription,
        content,
      );
    }
  }
}
