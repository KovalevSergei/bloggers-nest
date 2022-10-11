import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { IRepositoryBloggers } from '../bloggersRepository.interface';
import { BloggersRepository } from '../bloggersSQL.repository';
export class UpdateBloggersCommand {
  constructor(
    public id: string,
    public name: string,
    public youtubeUrl: string,
  ) {}
}
@CommandHandler(UpdateBloggersCommand)
export class UpdateBloggersUseCase
  implements ICommandHandler<UpdateBloggersCommand>
{
  constructor(
    @Inject('BloggersRepository')
    protected bloggersRepository: IRepositoryBloggers,
  ) {}

  async execute(command: UpdateBloggersCommand): Promise<boolean> {
    return await this.bloggersRepository.updateBloggers(
      command.id,
      command.name,
      command.youtubeUrl,
    );
  }
}
