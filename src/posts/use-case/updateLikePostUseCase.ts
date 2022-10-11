import { Inject } from '@nestjs/common';
import { UsersDBType } from '../../users/users.type';
import { likePosts } from '../posts.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IRepositoryUsersQuery } from '../../users/usersRepository.interface';
import {
  IPostsRepository,
  IPostsRepositoryQuery,
} from '../postsRepository.interface';
export class UpdateLikePostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public status: string,
  ) {}
}
@CommandHandler(UpdateLikePostCommand)
export class UpdateLikePostUseCase
  implements ICommandHandler<UpdateLikePostCommand>
{
  constructor(
    @Inject('PostsRepositorу') protected postsRepository: IPostsRepository,
    @Inject('PostsRepositoryQuery')
    protected postsRepositoryQuery: IPostsRepositoryQuery,
    @Inject('UsersRepositoryQuery')
    protected usersRepositoryQuery: IRepositoryUsersQuery,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(command: UpdateLikePostCommand): Promise<boolean> {
    const findLike = await this.postsRepositoryQuery.findLikeStatus(
      command.postId,
      command.userId,
    );
    const login = await this.usersRepositoryQuery.getUserById(command.userId);
    const login2 = login as UsersDBType;
    if (!findLike && command.status != 'None') {
      const likePostForm = new likePosts(
        command.postId,
        command.userId,
        login2.accountData.login,
        command.status,
        new Date(),
      );
      const result = await this.postsRepository.createLikeStatus(likePostForm);
      return true;
    }
    if (findLike && command.status === 'None') {
      await this.postsRepository.deleteLike(command.postId, command.userId);
      return true;
    }

    if (findLike?.myStatus === command.status) {
      return true;
    } else {
      await this.postsRepository.deleteLike(command.postId, command.userId);
      const login = await this.usersRepositoryQuery.getUserById(command.userId);
      const login2 = login as UsersDBType;
      const likePostForm = new likePosts(
        command.postId,
        command.userId,
        login2.accountData.login,
        command.status,
        new Date(),
      );
      const result = await this.postsRepository.createLikeStatus(likePostForm);
    }
    return true;
  }
}
