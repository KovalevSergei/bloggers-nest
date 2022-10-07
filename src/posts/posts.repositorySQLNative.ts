import { Injectable } from '@nestjs/common';

import { likePosts, postsType } from './posts.type';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IPostsRepository } from './postsRepository.interface';
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class PostsRepositoryNative implements IPostsRepository {
  postsModel: any;
  constructor(@InjectDataSource('Native') public dataSource: DataSource) {}

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
}
