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
import { IPostsRepositoryQuery } from './postsRepository.interface';
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class PostsRepositoryNativeQuery implements IPostsRepositoryQuery {
  postsModel: any;
  constructor(@InjectDataSource('Native') public dataSource: DataSource) {}
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

  async getpostsId(id: string): Promise<postsType | null> {
    const res = await this.dataSource.query(
      `SELECT posts.*,name as"bloggerName" 
      FROM "posts"
       LEFT JOIN "bloggers"
      ON posts."bloggerId"=bloggers.id
      WHERE posts.id=$1`,
      [id],
    );

    return res[0];
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

  // async getLikesBloggersPost(postsId: any): Promise<likePosts[]> {
  //   const result = await this.dataSource.query(
  //     `SELECT likeposts.*,login FROM "likeposts"
  //     LEFT JOIN "users"
  //   WHERE "myStatus"=$1 and "postsId"=$2`,
  //     ['Like', postsId],
  //   );

  //   return result;
  // }

  // async getDislikeBloggersPost(postsId: any): Promise<likePosts[]> {
  //   const result = await this.dataSource.query(
  //     `SELECT likeposts.*,login FROM "likeposts"
  //     LEFT JOIN "users"
  //   WHERE"myStatus"=$1 and "postsId"=$2`,
  //     ['Dislike', postsId],
  //   );

  //   return result;
  // }

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
