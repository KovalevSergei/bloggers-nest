import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/posts.repositorySQL';
import { BloggersRepository } from '../bloggersSQL.repository';
import { bloggersType } from '../bloggers.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class CreateBloggerCommand {
  constructor(public name: string, public youtubeUrl: string) {}
}
@CommandHandler(CreateBloggerCommand)
export class CreateBloggersUseCase
  implements ICommandHandler<CreateBloggerCommand>
{
  constructor(protected bloggersRepository: BloggersRepository) {}

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
