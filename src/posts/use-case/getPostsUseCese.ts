import { Inject, Injectable } from '@nestjs/common';
import { BloggersRepository } from '../../bloggers/bloggersSQL.repository';
import { CommentsRepository } from '../../comments/comments-repositorySQL';

import { PostsRepository } from '../posts.repositorySQL';
import { postsDBType } from '../posts.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepositoryQuery } from '../posts.repositoryMongoQuery';
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
    @Inject('PostsRepositoryQuery')
    protected postsRepositoryQuery: PostsRepositoryQuery,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(command: GetPostCommand): Promise<{
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: any[];
  }> {
    const { items, totalCount } = await this.postsRepositoryQuery.getPosts(
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
      const likesInformation = await this.postsRepositoryQuery.getLikeStatus(
        postId,
        command.userId,
      );
      const newestLikes = await this.postsRepositoryQuery.getNewestLikes(
        postId,
      );
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
