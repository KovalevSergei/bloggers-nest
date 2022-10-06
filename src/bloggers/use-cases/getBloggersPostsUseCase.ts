import { Injectable } from '@nestjs/common';
import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  IQueryHandler,
  QueryHandler,
} from '@nestjs/cqrs';
import { postsDBType } from '../../posts/posts.type';
import { BloggersRepository } from '../bloggersSQL.repository';
import { postsType } from '../../posts/posts.type';
import { PostsRepository } from '../../posts/posts.repositorySQL';
import { PostsRepositoryQuery } from '../../posts/posts.repositoryMongoQuery';
export class GetBloggerPostQuery {
  constructor(
    public bloggerId: string,
    public pageSize: number,
    public pageNumber: number,
    public userId: string,
  ) {}
}
@QueryHandler(GetBloggerPostQuery)
export class GetBloggersPostUseCase
  implements IQueryHandler<GetBloggerPostQuery>
{
  constructor(
    protected bloggersRepository: BloggersRepository,
    protected postsRepositoryQuery: PostsRepositoryQuery,
  ) {}

  async execute(
    command: GetBloggerPostQuery,
  ): Promise<postsDBType | boolean | postsType[]> {
    const { items, totalCount } =
      await this.postsRepositoryQuery.getBloggersPost(
        command.bloggerId,
        command.pageSize,
        command.pageNumber,
      );
    /*    const postIds = items.map(p => p.id)
const likes= await this.postsRepository.getLikesBloggersPost(postIds)
const dislikes=await this.postsRepository.getDislikeBloggersPost(postIds)
    items.forEach(p => {
      const postLikes = likes.filter(l => l.postId === p.id)

    }) */

    const items2 = [];

    if (totalCount === 0) {
      return false;
    } else {
      for (let i = 0; i < items.length; i++) {
        const postItt = items[i];
        const postId = postItt.id;
        const likesInformation = await this.postsRepositoryQuery.getLikeStatus(
          postId,
          command.userId,
        );
        const newestLikes = await this.postsRepositoryQuery.getNewestLikes(
          postId,
        );
        const newestLikesMap = newestLikes.map(
          (v: { addedAt: any; userId: any; login: any }) => ({
            addedAt: v.addedAt,
            userId: v.userId,
            login: v.login,
          }),
        );
        const a = {
          id: items[i].id,
          title: items[i].title,
          shortDescription: items[i].shortDescription,
          content: items[i].content,
          bloggerId: items[i].bloggerId,
          bloggerName: items[i].bloggerName,
          addedAt: items[i].addedAt,
          extendedLikesInfo: {
            likesCount: likesInformation.likesCount,
            dislikesCount: likesInformation.dislikesCount,
            myStatus: likesInformation.myStatus,
            newestLikes: newestLikesMap,
          },
        };
        items2.push(a);
      }
      let pagesCount = Number(Math.ceil(totalCount / command.pageSize));
      const result: postsDBType = {
        pagesCount: pagesCount,
        page: command.pageNumber,
        pageSize: command.pageSize,
        totalCount: totalCount,
        items: items2,
      };
      return result;
    }
  }
}
