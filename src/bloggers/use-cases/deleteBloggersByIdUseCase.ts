import { Inject, Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/posts.repositorySQL';
import { BloggersRepository } from '../bloggersSQL.repository';
import { postsType } from 'src/posts/posts.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IRepositoryBloggers } from '../bloggersRepository.interface';
export class DeleteBloggerCommand {
  constructor(public id: string) {}
}
@CommandHandler(DeleteBloggerCommand)
export class DeleteBloggersByIdUseCase
  implements ICommandHandler<DeleteBloggerCommand>
{
  constructor(
    @Inject('BloggersRepository')
    protected bloggersRepository: IRepositoryBloggers,
  ) {}

  async execute(command: DeleteBloggerCommand): Promise<boolean> {
    return this.bloggersRepository.deleteBloggersById(command.id);
  }
}
