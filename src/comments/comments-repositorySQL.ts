import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { COMMENTS_COLLECTION, LIKE_COMMENTS_COLLECTION } from 'src/db';
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
import { Comments, LikeComments, Posts, Users } from 'src/db.sql';
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
