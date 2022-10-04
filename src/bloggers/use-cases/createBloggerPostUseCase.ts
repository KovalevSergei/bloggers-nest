import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/posts.repositorySQL';
import { BloggersRepository } from '../bloggersSQL.repository';
import { postsType } from '../../posts/posts.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
    protected bloggersRepository: BloggersRepository,
    protected postsRepository: PostsRepository, //protected postsService: PostsService,
  ) {}

  async execute(
    command: CreateBloggersPostCommand,
    // bloggerId: string,
    // title: string,
    // shortDescription: string,
    // content: string,
  ): Promise<postsType | boolean> {
    const findName = await this.bloggersRepository.getBloggersById(
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
