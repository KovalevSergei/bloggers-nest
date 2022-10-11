import { Inject, Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/posts.repositorySQL';
import { BloggersRepository } from '../bloggersSQL.repository';
import { postsType } from '../../posts/posts.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggersRepositoryQuery } from '../bloggers.repositoryQueryMongo';
import {
  IRepositoryBloggers,
  IRepositoryBloggersQuery,
} from '../bloggersRepository.interface';
import { IPostsRepository } from '../../posts/postsRepository.interface';

export class CreateBloggersPostCommand {
  constructor(
    public bloggerId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(CreateBloggersPostCommand)
export class CreateBloggersPostUseCase
  implements ICommandHandler<CreateBloggersPostCommand>
{
  constructor(
    @Inject('BloggersRepository')
    protected bloggersRepository: IRepositoryBloggers,
    @Inject('PostsRepositorу') protected postsRepository: IPostsRepository, //protected postsService: PostsService,
    @Inject('BloggersRepositoryQuery')
    protected bloggersRepositoryQuery: IRepositoryBloggersQuery,
  ) {}

  async execute(
    command: CreateBloggersPostCommand,
    // bloggerId: string,
    // title: string,
    // shortDescription: string,
    // content: string,
  ): Promise<postsType | boolean> {
    const findName = await this.bloggersRepositoryQuery.getBloggersById(
      command.bloggerId,
    );

    if (!findName) {
      return false;
    } else {
      const postsnew = {
        id: Number(new Date()).toString(),
        title: command.title,
        shortDescription: command.shortDescription,
        content: command.content,
        bloggerId: command.bloggerId,
        bloggerName: findName.name,
        addedAt: new Date(),
      };

      const result = await this.postsRepository.createPosts(postsnew);

      return result;
    }
  }
}
