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
import {
  IRepositoryComments,
  IRepositoryCommentsQuery,
} from './use-case/commentsRepository.interface';
interface commentReturn {
  items: commentsDBType[];
  totalCount: number;
}
@Injectable()
export class CommentsRepositoryNativeQuery implements IRepositoryCommentsQuery {
  constructor(@InjectDataSource('Native') public dataSource: DataSource) {}

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
