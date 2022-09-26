import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { COMMENTS_COLLECTION, LIKE_COMMENTS_COLLECTION } from '../db';
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
interface commentReturn {
  items: commentsDBType[];
  totalCount: number;
}
@Injectable()
export class CommentsRepository {
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
  async getCommentAll(
    pageSize: number,
    pageNumber: number,
    postId: string,
  ): Promise<commentReturn> {
    const totalCount = await this.dataSource.query(
      `SELECT COUNT(id) FROM "comments" `,
    );

    const items = await this.dataSource.query(
      `SELECT id,content,"userId",login "userLogin","addedAt" FROM "comments" as v
      LEFT JOIN "users"
      ON users.id=v."userId"
    WHERE v."postId"=$3
    ORDER BY id
    LIMIT $1 OFFSET (($2-1)*$2)`,
      [pageSize, pageNumber, postId],
    );
    return { items: items, totalCount: +totalCount[0].count };
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
  async findLikeStatus(
    commentsId: string,
    userId: string,
  ): Promise<likeCommentsWithId | null> {
    const result = await this.dataSource.query(
      `SELECT likecomments*,login FROM "likecomments" 
      LEFT JOIN "users"
      ON  users.id=likecomments."userId"
    WHERE "commentsId"=$1 AND "userId"=$2`,
      [commentsId, userId],
    );
    return result;
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
  async getLikeStatus(
    commentsId: string,
    userId: string,
  ): Promise<{
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  }> {
    const result = { likesCount: 0, dislikesCount: 0, myStatus: 'None' };
    const likesCount = await this.dataSource.query(
      `SELECT COUNT(id) as res2 FROM "likecomments" 
      WHERE 
      commentsId= $1 and
      myStatus='Like'`,
      [commentsId],
    );
    result.likesCount = +likesCount[0].res2;
    const disLikes = await this.dataSource.query(
      `SELECT COUNT(id) as res3 FROM "likecomments" 
      WHERE 
        commentsId= $1 and
        myStatus='Dislike'`,
      [commentsId],
    );
    result.dislikesCount = +disLikes[0].res3;
    const my = await this.dataSource.query(
      `SELECT * FROM "likecomments" WHERE 
          "commentsId"= $1 and
          "userId"=$2`,
      [commentsId, userId],
    );

    if (my.length === 0) {
      return result;
    } else {
      const a = my;
      result.myStatus = a.myStatus;
    }

    return result;
  }
}
