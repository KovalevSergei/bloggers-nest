import { BloggersRepository } from '../../bloggers/bloggersSQL.repository';
import { PostsRepository } from '../posts.repositorySQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggersRepositoryQuery } from '../../bloggers/bloggers.repositoryQueryMongo';
export class UpdatePostCommand {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public bloggerId: string,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostsUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected bloggersRepository: BloggersRepository,
    protected bloggersRepositoryQuery: BloggersRepositoryQuery,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(command: UpdatePostCommand): Promise<boolean | null> {
    const nameblog = await this.bloggersRepositoryQuery.getBloggersById(
      command.bloggerId,
    );

    if (!nameblog) {
      return null;
    } else {
      return await this.postsRepository.updatePostsId(
        command.id,
        command.title,
        command.shortDescription,
        command.content,
      );
    }
  }
}
