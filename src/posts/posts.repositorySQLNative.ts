import { Injectable } from '@nestjs/common';

import {
  likePosts,
  likePostWithId,
  postsreturn,
  postsType,
} from './posts.type';
import { ObjectId } from 'mongodb';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { POSTS_COLLECTION } from '../db';
import { Model } from 'mongoose';
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class PostsRepository {
  postsModel: any;
  constructor(@InjectDataSource() public dataSource: DataSource) {}
  async getPosts(pageNumber: number, pageSize: number): Promise<postsreturn> {
    /* const posts = await this.postsModel
      .find({}, { projection: { _id: 0 } })
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .lean();
    const totalCount = await this.postsModel.countDocuments(); */
    const posts = await this.dataSource.query(
      `SELECT 
        posts.*,
        name as "bloggerName" 
      FROM "posts" 
      LEFT JOIN "bloggers" 
     ON posts."bloggerId"=bloggers.id
      LIMIT $1 OFFSET (($2 - 1) * $1)`,
      [pageSize, pageNumber],
    );
    const totalCount = await this.dataSource.query(
      `SELECT COUNT(id) FROM "posts"`,
    );
    return {
      totalCount: +totalCount[0].count,
      items: posts,
    };
  }
  async createPosts(postsnew: postsType): Promise<postsType> {
    /*  const postsInstance = new this.postsModel();
    postsInstance.id = postsnew.id;

    postsInstance.title = postsnew.title;
    postsInstance.shortDescription = postsnew.shortDescription;
    postsInstance.content = postsnew.content;
    postsInstance.bloggerId = postsnew.bloggerId;
    postsInstance.bloggerName = postsnew.bloggerName;
    postsInstance.addedAt = postsnew.addedAt;

    await postsInstance.save(); */

    await this.dataSource.query(
      `INSERT INTO "posts" 
      (id,title,"shortDescription",content,"bloggerId","addedAt")
       VALUES($1,$2,$3,$4,$5,$6)`,
      [
        postsnew.id,
        postsnew.title,
        postsnew.shortDescription,
        postsnew.content,
        postsnew.bloggerId,
        postsnew.addedAt,
      ],
    );
    return postsnew;
  }
  async getpostsId(id: string): Promise<postsType | null> {
    const res = await this.dataSource.query(
      `SELECT posts.*,name as"bloggerName" 
      FROM "posts"
       LEFT JOIN "bloggers"
      ON posts."bloggerId"=bloggers.id
      WHERE posts.id=$1`,
      [id],
    );
    console.log(res, '1');
    return res[0];
  }
  async updatePostsId(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
  ): Promise<boolean | null> {
    const postsInstance = await this.dataSource.query(
      `SELECT * FROM posts
      WHERE id=$1`,
      [id],
    );

    if (postsInstance.length === 0) {
      return false;
    }
    await this.dataSource.query(
      `UPDATE "posts" 
      SET title=$2, "shortDescription"=$3,content=$4 
      WHERE id=$1`,
      [id, title, shortDescription, content],
    );

    return true;
  }
  async deletePosts(id: string): Promise<boolean> {
    const postsInstance = await this.dataSource.query(
      `SELECT * 
      FROM "posts" 
      WHERE id=$1`,
      [id],
    );
    if (postsInstance.length === 0) {
      return false;
    }
    await this.dataSource.query(`DELETE FROM "posts" where id=$1`, [id]);

    return true;
  }

  async getBloggersPost(
    bloggerId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<postsReturn> {
    /*     const postsBloggerId = await this.dataSource.query(
      `SELECT COUNT("bloggerId" FROM "Posts"
     WHERE "bloggerId"=$1)`,
      [bloggerId],
    );
    const totalCount = +postsBloggerId[0].count; */

    const items = await this.dataSource.query(
      `SELECT "posts".*, name as "bloggerName" 
        FROM "posts" LEFT JOIN "bloggers"
      ON bloggers.id=posts."bloggerId"
        WHERE "bloggerId"=$1 LIMIT $2 OFFSET(($3-1)*$2)`,
      [bloggerId, pageSize, pageNumber],
    );
    const totalCount = items.length;
    return {
      totalCount: totalCount,
      items: items,
    };
  }

  async createLikeStatus(likePostForm: likePosts): Promise<boolean> {
    await this.dataSource.query(
      `INSERT INTO
"likeposts"("postsId","userId","myStatus","addedAt") 
VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        likePostForm.postsId,
        likePostForm.userId,
        likePostForm.myStatus,
        likePostForm.addedAt,
      ],
    );
    return true;
  }
  async deleteLike(postId: string, userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT * FROM "likeposts" 
    WHERE "postsId"=$1 AND "userId"=$2`,
      [postId, userId],
    );

    if (result.length === 0) {
      return false;
    }
    await this.dataSource.query(
      `DELETE FROM "likeposts" 
    WHERE "postsId"=$1 AND "userId"=$2`,
      [postId, userId],
    );
    return true;
  }
  async getLikeStatus(
    postId: string,
    userId: string,
  ): Promise<{
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  }> {
    const result = { likesCount: 0, dislikesCount: 0, myStatus: 'None' };
    const likesCount = await this.dataSource.query(
      `SELECT COUNT("postsId") as res2 FROM "likeposts" 
      WHERE 
      "postsId"= $1 and
      "myStatus"='Like'`,
      [postId],
    );
    result.likesCount = +likesCount[0].res2;
    const disLikes = await this.dataSource.query(
      `SELECT COUNT("postsId") as res3 FROM "likeposts" WHERE 
        "postsId"= $1 and
        "myStatus"='Dislike'`,
      [postId],
    );
    result.dislikesCount = +disLikes[0].res3;
    const my = await this.dataSource.query(
      `SELECT * FROM "likeposts" WHERE 
          "postsId"= $1 and
          "userId"=$2`,
      [postId, userId],
    );

    if (my.length === 0) {
      return result;
    } else {
      const a = my;
      result.myStatus = a.myStatus;
    }

    return result;
  }
  async getNewestLikes(postId: string): Promise<likePosts[]> {
    const result = await this.dataSource.query(
      `SELECT likeposts.*,login FROM "likeposts" 
      LEFT JOIN "users"
      ON users.id=likeposts."userId"
    WHERE "postsId"=$1 and "myStatus"=$2 ORDER BY "addedAt" DESC`,
      [postId, 'Like'],
    );

    return result || [];
  }
  async getLikesBloggersPost(postsId: any): Promise<likePosts[]> {
    const result = await this.dataSource.query(
      `SELECT likeposts.*,login FROM "likeposts"
      LEFT JOIN "users"
    WHERE "myStatus"=$1 and "postsId"=$2`,
      ['Like', postsId],
    );

    return result;
  }
  async getDislikeBloggersPost(postsId: any): Promise<likePosts[]> {
    const result = await this.dataSource.query(
      `SELECT likeposts.*,login FROM "likeposts" 
      LEFT JOIN "users"
    WHERE"myStatus"=$1 and "postsId"=$2`,
      ['Dislike', postsId],
    );

    return result;
  }
  async findLikeStatus(
    postId: string,
    userId: string,
  ): Promise<likePosts | null> {
    const result = await this.dataSource.query(
      `SELECT likeposts.*,login FROM "likeposts" 
      LEFT JOIN "users"
    WHERE postId=$1 and "userId"=$2`,
      [postId, userId],
    );
    if ((result.length = 0)) {
      return null;
    }
    return result[0];
  }
}
