import { BloggersRepository } from '../../bloggers/bloggersSQL.repository';
import { CommentsRepository } from '../../comments/comments-repositorySQL';
import {
  commentsDBPostIdType,
  commentsDBType2,
} from 'src/comments/comments.type';

import { PostsRepository } from '../posts.repositorySQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IPostsRepository } from '../postsRepository.interface';
import { IRepositoryBloggers } from '../../bloggers/bloggersRepository.interface';
import { IRepositoryComments } from '../../comments/use-case/commentsRepository.interface';
export class CreateCommentsCommand {
  constructor(
    public userId: string,
    public userLogin: string,
    public postId: string,
    public content: string,
  ) {}
}
@CommandHandler(CreateCommentsCommand)
export class CreateCommentsUseCase
  implements ICommandHandler<CreateCommentsCommand>
{
  constructor(
    @Inject('PostsRepositorу') protected postsRepository: IPostsRepository,

    @Inject('CommentsRepository')
    protected commentsRepository: IRepositoryComments,
  ) {}
  //protected usersRepository: UsersRepository){}

  async execute(command: CreateCommentsCommand): Promise<commentsDBType2> {
    const commentNew: commentsDBPostIdType = {
      id: Number(new Date()).toString(),
      content: command.content,
      userId: command.userId,
      userLogin: command.userLogin,
      addedAt: new Date().toString(),
      postId: command.postId,
    };
    const result = await this.commentsRepository.createComment(commentNew);
    const result2 = {
      ...result,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
    return result2;
  }
}
