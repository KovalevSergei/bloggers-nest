import { Injectable } from '@nestjs/common';
import {
  commentsDBPostIdType,
  commentsDBType,
  commentsDBType2,
  likeComments,
  likeCommentsWithId,
} from './comments.type';
import { ObjectId } from 'mongodb';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Comments, LikeComments, Posts, Users } from '../db.sql';
import { IRepositoryComments } from './use-case/commentsRepository.interface';
interface commentReturn {
  items: commentsDBType[];
  totalCount: number;
}
@Injectable()
export class CommentsRepositorySql implements IRepositoryComments {
  constructor(@InjectDataSource('ORM') public dataSource: DataSource) {}
  async updateComment(
    content: string,
    commentId: string,
    //userId: string,
  ): Promise<boolean | null> {
    const a = await this.dataSource
      .createQueryBuilder()
      .update(Comments)
      .set({
        content: content,
      })
      .where('comments.id=:commentId', { commentId })
      .execute();

    return a.affected === 1;
  }

  async deleteComment(id: string): Promise<boolean | null> {
    const commentInstance = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Comments)
      .where('comments.id=:id', { id })
      .execute();

    return commentInstance.affected === 1;
  }
  async createComment(comment: commentsDBPostIdType): Promise<commentsDBType2> {
    const commentCreate = new Comments();
    commentCreate.id = comment.id;
    commentCreate.content = comment.content;
    commentCreate.addedAt = new Date();
    const user = await this.dataSource
      .getRepository(Users)
      .findOne({ where: { id: comment.userId } });
    const post = await this.dataSource
      .getRepository(Posts)
      .findOne({ where: { id: comment.postId } });
    commentCreate.post = post;
    commentCreate.user = user;
    await this.dataSource.getRepository(Comments).save(commentCreate);
    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      userLogin: comment.userLogin,
      addedAt: comment.addedAt,
    };
  }

  async createLikeStatus(likeCommentForm: likeComments): Promise<boolean> {
    const likeStatus = new LikeComments();
    likeStatus.addedAt = likeCommentForm.addedAt;
    likeStatus.myStatus = likeCommentForm.myStatus;
    const comments = await this.dataSource
      .getRepository(Comments)
      .findOne({ where: { id: likeCommentForm.commentsId } });
    const user = await this.dataSource
      .getRepository(Users)
      .findOne({ where: { id: likeCommentForm.userId } });
    likeStatus.users = user;
    likeStatus.comments = comments;
    await this.dataSource.getRepository(LikeComments).save(likeStatus);
    /*     query(
      `INSERT INTO
"likecomments"("commentsId","userId","myStatus","addedAt","login") 
VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        likeCommentForm.commentsId,
        likeCommentForm.userId,
        likeCommentForm.myStatus,
        likeCommentForm.addedAt,
        likeCommentForm.login,
      ],
    ); */
    return true;
  }

  async deleteLike(commentsId: string, userId: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(LikeComments)
      .where('comments.id=:commentsId', { commentsId })
      .where('users.id=:userId', { userId })
      .execute();

    /*  
    query(
      `SELECT * FROM "likecomments" 
    WHERE "commentsId"=$1 AND "userId"=$2`,
      [commentsId, userId],
    );

    if (result.length === 0) {
      return false;
    }
    await this.dataSource.query(
      `DELETE FROM "likecomments" 
    WHERE "commentsId"=$1 AND "userId"=$2`,
      [commentsId, userId],
    ); */
    return result.affected === 1;
  }
}
