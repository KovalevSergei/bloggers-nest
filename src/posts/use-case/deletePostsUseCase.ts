import { Inject, Injectable } from '@nestjs/common';
import { BloggersRepository } from '../../bloggers/bloggersSQL.repository';
import { CommentsRepository } from '../../comments/comments-repositorySQL';
import {
  commentDBTypePagination,
  commentsDBPostIdType,
  commentsDBType2,
} from 'src/comments/comments.type';
import { Posts } from '../../db.sql';
import { UsersRepository } from '../../users/users-repositorySQL';
import { UsersDBType } from '../../users/users.type';
import { PostsRepository } from '../posts.repositorySQL';
import {
  likePosts,
  likePostWithId,
  postsDBType,
  postsType,
} from '../posts.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class DeletePostComand {
  constructor(public id: string) {}
}
@CommandHandler(DeletePostComand)
export class DeletePostsUseCase implements ICommandHandler<DeletePostComand> {
  constructor(
    @Inject('PostsRepositorу') protected postsRepository: PostsRepository,
  ) {}
  //protected usersRepository: UsersRepository){}
  async execute(command: DeletePostComand): Promise<boolean> {
    return this.postsRepository.deletePosts(command.id);
  }
}
