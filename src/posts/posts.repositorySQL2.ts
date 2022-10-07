import { Injectable } from '@nestjs/common';

import { likePosts, postsreturn, postsType } from './posts.type';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Bloggers, LikePosts, Posts, Users } from '../db.sql';
import { IPostsRepository } from './postsRepository.interface';
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class PostsRepositorySql implements IPostsRepository {
  postsModel: any;
  constructor(@InjectDataSource() public dataSource: DataSource) {}

  async createPosts(postsnew: postsType): Promise<postsType> {
    const post = new Posts();
    post.id = postsnew.id;
    post.title = postsnew.title;
    post.shortDescription = postsnew.shortDescription;
    post.content = postsnew.content;
    post.addedAt = postsnew.addedAt;

    const blogger = await this.dataSource.getRepository(Bloggers).findOne({
      where: {
        id: postsnew.bloggerId,
      },
    });
    post.blogger = blogger;

    const postEentity = await this.dataSource.getRepository(Posts).save(post);

    return postsnew;

    /*   const a = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Posts)
      .values([
        {
          id: postsnew.id,
          title: postsnew.title,
          shortDescription: postsnew.shortDescription,
          content: postsnew.content,
          addedAt: postsnew.addedAt,
          bloggerId: postsnew.bloggerId,
        },
      ])
      .execute();

    return postsnew; */
  }

  async updatePostsId(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
  ): Promise<boolean | null> {
    const a = await this.dataSource
      .createQueryBuilder()
      .update(Posts)
      .set({
        title: title,
        shortDescription: shortDescription,
        content: content,
      })
      .where('posts.id=:id', { id })
      .execute();
    return a.affected === 1;
  }
  async deletePosts(id: string): Promise<boolean> {
    /*    const postsInstance = await this.dataSource
      .getRepository(Posts)
      .createQueryBuilder('posts')
      .where('posts.id=:id', { id })
      .getOne();
    if (postsInstance === null) {
      return false;
    } */
    const a = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Posts)
      .where('posts.id=:id', { id })
      .execute();

    return a.affected === 1;
  }

  async createLikeStatus(likePostForm: likePosts): Promise<boolean> {
    const likeStatus = new LikePosts();
    likeStatus.addedAt = likePostForm.addedAt;
    likeStatus.myStatus = likePostForm.myStatus;
    const post = await this.dataSource
      .getRepository(Posts)
      .findOne({ where: { id: likePostForm.userId } });
    const user = await this.dataSource
      .getRepository(Users)
      .findOne({ where: { id: likePostForm.userId } });
    likeStatus.users = user;
    likeStatus.posts = post;

    await this.dataSource.getRepository(LikePosts).save(likeStatus);
    /*   query(
      `INSERT INTO
"likeposts"("postsId","userId","myStatus","addedAt") 
VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        likePostForm.postsId,
        likePostForm.userId,
        likePostForm.myStatus,
        likePostForm.addedAt,
      ],
    ); */
    return true;
  }
  async deleteLike(postId: string, userId: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(LikePosts)
      .where('posts.id=:postId', { postId })
      .where('users.id=:userId', { userId })
      .execute();

    /*  query(
      `SELECT * FROM "likeposts" 
    WHERE "postsId"=$1 AND "userId"=$2`,
      [postId, userId],
    ); */
    return result.affected === 1;
  }
}
