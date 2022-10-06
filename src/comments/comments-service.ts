import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users-repositorySQL';
import { CommentsRepository } from './comments-repositorySQL';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
  ) {}
  // async updateContent(
  //   content: string,
  //   commentId: string,
  //   //userId: string
  // ): Promise<boolean | null> {
  //   const UpdateComment = await this.commentsRepository.updateComment(
  //     content,
  //     commentId,
  //     //userId
  //   );
  //   return UpdateComment;
  // }
  /*   async getComment(id: string): Promise<commentsDBType | null> {
    const comment = await this.commentsRepository.getComment(id);
    return comment;
  } */
  /*   async deleteComment(id: string): Promise<boolean | null> {
    const isdelete = await this.commentsRepository.deleteComment(id);
    return isdelete;
  } */

  /*   async getCommentsPost(
    pageSize: number,
    pageNumber: number,
    postId: string,
  ): Promise<commentDBTypePagination | boolean> {
    const { items, totalCount } = await this.commentsRepository.getCommentAll(
      pageSize,
      pageNumber,
      postId,
    );
    let pagesCount = Number(Math.ceil(totalCount / pageSize));
    const result: commentDBTypePagination = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: items,
    };
    return result;
  } */
}

/*  async getLike(
    commentsId: string,
    userId: string,
  ): Promise<{ likesCount: number; dislikesCount: number; myStatus: string }> {
    const result = await this.commentsRepository.getLikeStatus(
      commentsId,
      userId,
    );
    return result;
  } */
