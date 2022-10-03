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
export class CreatePostsUseCase {
  constructor(
    protected postsRepository: PostsRepository,
    protected bloggersRepository: BloggersRepository,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(
    title: string,
    shortDescription: string,
    content: string,
    bloggerId: string,
  ): Promise<postsType | boolean> {
    const nameblog = await this.bloggersRepository.getBloggersById(bloggerId);
    if (nameblog) {
      const postnew = {
        id: Number(new Date()).toString(),
        title: title,
        shortDescription: shortDescription,
        content: content,
        bloggerId: bloggerId,
        bloggerName: nameblog.name,
        addedAt: new Date(),
        //extendedLikesInfo: {
        //likesCount: 0,
        //dislikesCount: 0,
        //myStatus: "None",
        // newestLikes: [],},
      };

      await this.postsRepository.createPosts(postnew);
      const postnew2 = {
        id: postnew.id,
        title: title,
        shortDescription: shortDescription,
        content: content,
        bloggerId: bloggerId,
        bloggerName: nameblog.name,
        addedAt: postnew.addedAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      };

      return postnew2;
    } else {
      return false;
    }
  }
}
