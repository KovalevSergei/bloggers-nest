import { BloggersRepository } from '../../bloggers/bloggersSQL.repository';
import { PostsRepository } from '../posts.repositorySQL';
import { postsType } from '../posts.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggersRepositoryQuery } from '../../bloggers/bloggers.repositoryQueryMongo';
export class CreatePostsCommand {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public bloggerId: string,
  ) {}
}
@CommandHandler(CreatePostsCommand)
export class CreatePostsUseCase implements ICommandHandler<CreatePostsCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected bloggersRepository: BloggersRepository,
    protected bloggersRepositoryQuery: BloggersRepositoryQuery,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(command: CreatePostsCommand): Promise<postsType | boolean> {
    const nameblog = await this.bloggersRepositoryQuery.getBloggersById(
      command.bloggerId,
    );
    if (nameblog) {
      const postnew = {
        id: Number(new Date()).toString(),
        title: command.title,
        shortDescription: command.shortDescription,
        content: command.content,
        bloggerId: command.bloggerId,
        bloggerName: nameblog.name,
        addedAt: new Date(),
        //extendedLikesInfo: {
        //likesCount: 0,
        //dislikesCount: 0,
        //myStatus: "None",
        // newestLikes: [],},
      };

      await this.postsRepository.createPosts(postnew);
      const postnew2 = {
        id: postnew.id,
        title: command.title,
        shortDescription: command.shortDescription,
        content: command.content,
        bloggerId: command.bloggerId,
        bloggerName: nameblog.name,
        addedAt: postnew.addedAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      };

      return postnew2;
    } else {
      return false;
    }
  }
}
