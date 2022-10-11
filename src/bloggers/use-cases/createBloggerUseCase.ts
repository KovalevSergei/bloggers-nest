import { Inject, Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/posts.repositorySQL';
import { BloggersRepository } from '../bloggersSQL.repository';
import { bloggersType } from '../bloggers.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IRepositoryBloggers } from '../bloggersRepository.interface';
export class CreateBloggerCommand {
  constructor(public name: string, public youtubeUrl: string) {}
}
@CommandHandler(CreateBloggerCommand)
export class CreateBloggersUseCase
  implements ICommandHandler<CreateBloggerCommand>
{
  constructor(
    @Inject('BloggersRepository')
    protected bloggersRepository: IRepositoryBloggers,
  ) {}

  async execute(command: CreateBloggerCommand): Promise<bloggersType> {
    const bloggersnew = {
      id: Number(new Date()).toString(),
      name: command.name,
      youtubeUrl: command.youtubeUrl,
    };

    const result = this.bloggersRepository.createBloggers(bloggersnew);

    return result;
  }
}
