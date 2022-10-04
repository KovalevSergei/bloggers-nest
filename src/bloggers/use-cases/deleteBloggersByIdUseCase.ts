import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/posts.repositorySQL';
import { BloggersRepository } from '../bloggersSQL.repository';
import { postsType } from 'src/posts/posts.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class DeleteBloggerCommand {
  constructor(public id: string) {}
}
@CommandHandler(DeleteBloggerCommand)
export class DeleteBloggersByIdUseCase
  implements ICommandHandler<DeleteBloggerCommand>
{
  constructor(protected bloggersRepository: BloggersRepository) {}

  async execute(command: DeleteBloggerCommand): Promise<boolean> {
    return this.bloggersRepository.deleteBloggersById(command.id);
  }
}
