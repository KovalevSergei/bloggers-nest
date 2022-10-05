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
export class GetPostCommand {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public userId: string,
  ) {}
}
@CommandHandler(GetPostCommand)
export class GetPostUseCase implements ICommandHandler<GetPostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected bloggersRepository: BloggersRepository,
    protected commentsRepository: CommentsRepository,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(command: GetPostCommand): Promise<{
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: any[];
  }> {
    const { items, totalCount } = await this.postsRepository.getPosts(
      command.pageNumber,
      command.pageSize,
    );

    let items2 = items.map((v) => ({
      id: v.id,
      title: v.title,
      shortDescription: v.shortDescription,
      content: v.content,
      bloggerId: v.bloggerId,
      bloggerName: v.bloggerName,
      addedAt: v.addedAt,
    }));
    let pagesCount = Number(Math.ceil(totalCount / command.pageSize));
    const getPosts: postsDBType = new postsDBType(
      pagesCount,
      command.pageNumber,
      command.pageSize,
      totalCount,
      items2,
    );

    const itemsPost = getPosts.items;
    const items3 = [];

    for (let i = 0; i < itemsPost.length; i++) {
      const postId = itemsPost[i].id;
      const likesInformation = await this.postsRepository.getLikeStatus(
        postId,
        command.userId,
      );
      const newestLikes = await this.postsRepository.getNewestLikes(postId);
      const newestLikesMap = newestLikes.map((v) => ({
        addedAt: v.addedAt,
        userId: v.userId,
        login: v.login,
      }));
      const a = {
        id: itemsPost[i].id,
        title: itemsPost[i].title,
        shortDescription: itemsPost[i].shortDescription,
        content: itemsPost[i].content,
        bloggerId: itemsPost[i].bloggerId,
        bloggerName: itemsPost[i].bloggerName,
        addedAt: itemsPost[i].addedAt,
        extendedLikesInfo: {
          likesCount: likesInformation.likesCount,
          dislikesCount: likesInformation.dislikesCount,
          myStatus: likesInformation.myStatus,
          newestLikes: newestLikesMap,
        },
      };
      items3.push(a);
    }

    const result = {
      pagesCount: getPosts.pagesCount,
      page: command.pageNumber,
      pageSize: command.pageSize,
      totalCount: getPosts.totalCount,
      items: items3,
    };

    return result;
  }
}
