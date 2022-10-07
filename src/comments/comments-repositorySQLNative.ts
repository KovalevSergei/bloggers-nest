import { Injectable } from '@nestjs/common';
import {
  commentsDBPostIdType,
  commentsDBType,
  commentsDBType2,
  likeComments,
  likeCommentsWithId,
} from './comments.type';

import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IRepositoryComments } from './use-case/commentsRepository.interface';
interface commentReturn {
  items: commentsDBType[];
  totalCount: number;
}
@Injectable()
export class CommentsRepositoryNative implements IRepositoryComments {
  constructor(@InjectDataSource() public dataSource: DataSource) {}
  async updateComment(
    content: string,
    commentId: string,
    //userId: string,
  ): Promise<boolean | null> {
    await this.dataSource.query(
      `UPDATE "comments" SET "content"=$1 WHERE id=$2`,
      [content, commentId],
    );
    return true;
  }
  async getComment(id: string): Promise<commentsDBType | null> {
    const result = await this.dataSource.query(
      `SELECT comments.id,content,"userId",login as 
      "userLogin","addedAt" FROM "comments"
      LEFT JOIN "users"
      ON users.id=comments."userId" 
      WHERE comments.id=$1`,
      [id],
    );
    return result[0];
  }
  async deleteComment(id: string): Promise<boolean | null> {
    const commentInstance = await this.dataSource.query(
      `SELECT * FROM "comments" WHERE id=$1`,
      [id],
    );
    if (commentInstance.length === 0) {
      return false;
    }

    await this.dataSource.query(`DELETE FROM "comments" WHERE id=$1`, [id]);
    return true;
  }
  async createComment(comment: commentsDBPostIdType): Promise<commentsDBType2> {
    await this.dataSource.query(
      `INSERT INTO
       "comments"("id","content","userId","addedAt","postId") 
      VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        comment.id,
        comment.content,
        comment.userId,
        comment.addedAt,
        comment.postId,
      ],
    );
    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      userLogin: comment.userLogin,
      addedAt: comment.addedAt,
    };
  }

  async createLikeStatus(likeCommentForm: likeComments): Promise<boolean> {
    await this.dataSource.query(
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
    );
    return true;
  }

  async deleteLike(commentsId: string, userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
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
    );
    return true;
  }
}
