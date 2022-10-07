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
import {
  IRepositoryComments,
  IRepositoryCommentsQuery,
} from './use-case/commentsRepository.interface';
interface commentReturn {
  items: commentsDBType[];
  totalCount: number;
}
@Injectable()
export class CommentsRepositorySqlQuery implements IRepositoryCommentsQuery {
  constructor(@InjectDataSource() public dataSource: DataSource) {}

  async getComment(id: string): Promise<commentsDBType | null> {
    const result = await this.dataSource
      .getRepository(Comments)
      .createQueryBuilder('comments')
      .leftJoinAndSelect('comments.user', 'user')
      .leftJoinAndSelect('comments.post', 'post')
      .where('comments.id=:id', { id })
      .getMany();
    if (result.length === 0) {
      return null;
    }
    const a = {
      id: result[0].id,
      postId: result[0].post.id,
      content: result[0].content,
      userId: result[0].user.id,
      userLogin: result[0].user.login,
      addedAt: result[0].addedAt,
    };

    /*  `SELECT comments.id,content,"userId",login as 
      "userLogin","addedAt" FROM "comments"
      LEFT JOIN "users"
      ON users.id=comments."userId" 
      WHERE comments.id=$1`,
      [id], */

    return a;
  }

  async getCommentAll(
    pageSize: number,
    pageNumber: number,
    postId: string,
  ): Promise<commentReturn> {
    const totalCount = await this.dataSource
      .getRepository(Comments)
      .createQueryBuilder('comments')
      .getCount();

    const items = await this.dataSource
      .getRepository(Comments)
      .createQueryBuilder('comments')
      .leftJoinAndSelect('post.comment', 'post')
      .leftJoinAndSelect('user.comment', 'comment')
      .where('comments.post.id=:postId', { postId })
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getMany();

    const a = items.map((v) => ({
      id: v.id,
      postId: v.post.id,
      content: v.content,
      userId: v.user.id,
      userLogin: v.user.login,
      addedAt: v.addedAt,
    }));

    /*  query(
      `SELECT id,content,"userId",login "userLogin","addedAt" FROM "comments" as v
      LEFT JOIN "users"
      ON users.id=v."userId"
    WHERE v."postId"=$3
    ORDER BY id
    LIMIT $1 OFFSET (($2-1)*$2)`,
      [pageSize, pageNumber, postId],
    ); */
    return { items: a, totalCount: totalCount };
  }

  async findLikeStatus(
    commentsId: string,
    userId: string,
  ): Promise<likeCommentsWithId | null> {
    const result = await this.dataSource
      .getRepository(LikeComments)
      .createQueryBuilder('likeComments')
      .leftJoinAndSelect('likeComments.comments', 'commetns')
      .where('comments.id=.commentsId', { commentsId })
      .leftJoinAndSelect('likeComments.users', 'users')
      .where('users.id=:userId', { userId })
      .getMany();
    if (result.length === 0) {
      return null;
    }
    const v = result;
    const res = {
      _id: new ObjectId(),
      commentsId: v[0].comments.id,
      addedAt: v[0].addedAt,
      myStatus: v[0].myStatus,
      login: v[0].users.login,
      userId: v[0].users.id,
    };

    /*   query(
      `SELECT likecomments*,login FROM "likecomments" 
      LEFT JOIN "users"
      ON  users.id=likecomments."userId"
    WHERE "commentsId"=$1 AND "userId"=$2`,
      [commentsId, userId],
    ); */
    return res;
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
    const likesCount = await this.dataSource
      .getRepository(LikeComments)
      .createQueryBuilder('likeComments')
      .leftJoinAndSelect('likeComments.comments', 'comments')
      .where('likeComments.comments.id=:commentsId', { commentsId })
      .where('myStatus=:a', { a: 'Like' })
      .getCount();

    /* query(
      `SELECT COUNT(id) as res2 FROM "likecomments" 
      WHERE 
      commentsId= $1 and
      myStatus='Like'`,
      [commentsId],
    ); */
    result.likesCount = likesCount;
    const disLikes = await this.dataSource
      .getRepository(LikeComments)
      .createQueryBuilder('likeComments')
      .leftJoinAndSelect('likeComments.comments', 'comments')
      .where('likeComments.comments.id=:commentsId', { commentsId })
      .where('likeComments.myStatus=:a', { a: 'Dislike' })
      .getCount();

    /*    query(
      `SELECT COUNT(id) as res3 FROM "likecomments" 
      WHERE 
        commentsId= $1 and
        myStatus='Dislike'`,
      [commentsId],
    ); */
    result.dislikesCount = disLikes;
    const my = await this.dataSource
      .getRepository(LikeComments)
      .createQueryBuilder('likeComments')
      .leftJoinAndSelect('likeComments.comments', 'comments')
      .where('likeComments.comments.id=:commentsId', { commentsId })
      .leftJoinAndSelect('likeComments.users', 'users')
      .where('likeComments.user.id=:userId', { userId })
      .getMany();

    /* 
    query(
      `SELECT * FROM "likecomments" WHERE 
          "commentsId"= $1 and
          "userId"=$2`,
      [commentsId, userId],
    );
 */
    if (my.length === 0) {
      return result;
    } else {
      const a = my;
      result.myStatus = a[0].myStatus;
    }

    return result;
  }
}
