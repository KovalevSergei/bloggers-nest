import { Injectable } from '@nestjs/common';

import { likePosts, postsreturn, postsType } from './posts.type';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Bloggers, LikePosts, Posts, Users } from '../db.sql';
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class PostsRepository {
  postsModel: any;
  constructor(@InjectDataSource() public dataSource: DataSource) {}
  async getPosts(pageNumber: number, pageSize: number): Promise<postsreturn> {
    const posts = await this.dataSource
      .getRepository(Posts)
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.blogger', 'blogger')
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getMany();
    const items = posts.map((v) => ({
      id: v.id,
      title: v.title,
      shortDescription: v.shortDescription,
      content: v.content,
      bloggerId: v.blogger.id,
      bloggerName: v.blogger.name,
      addedAt: v.addedAt,
    }));
    const totalCount = await this.dataSource
      .getRepository(Posts)
      .createQueryBuilder('posts')
      .getCount();
    return {
      totalCount: totalCount,
      items: items,
    };
  }
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
  async getpostsId(id: string): Promise<postsType | null> {
    const res = await this.dataSource
      .getRepository(Posts)
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.blogger', 'blogger')
      .where('posts.id=:id', { id })
      .getMany();

    const items = res.map((v) => ({
      id: v.id,
      title: v.title,
      shortDescription: v.shortDescription,
      content: v.content,
      bloggerId: v.blogger.id,
      bloggerName: v.blogger.name,
      addedAt: v.addedAt,
    }));
    return items[0];
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

  async getBloggersPost(
    bloggerId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<postsReturn> {
    const items = await this.dataSource
      .getRepository(Posts)
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.blogger', 'blogger')
      .where('posts.blogger.id=:bloggerId', { bloggerId })
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getMany();
    const items2 = items.map((v) => ({
      id: v.id,
      title: v.title,
      shortDescription: v.shortDescription,
      content: v.content,
      bloggerId: v.blogger.id,
      bloggerName: v.blogger.name,
      addedAt: v.addedAt,
    }));
    const totalCount = items.length;
    return {
      totalCount: totalCount,
      items: items2,
    };
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
  async getLikeStatus(
    postId: string,
    userId: string,
  ): Promise<{
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  }> {
    const result = { likesCount: 0, dislikesCount: 0, myStatus: 'None' };
    const likesCount = await this.dataSource
      .getRepository(LikePosts)
      .createQueryBuilder('likePosts')
      .leftJoinAndSelect('likePosts.posts', 'posts')
      .where('posts.id = :postId', { postId })
      .where('likePosts.myStatus = :like', { like: 'Like' })
      .getCount();
    /*   .query(
      `SELECT COUNT("postsId") as res2 FROM "likeposts" 
      WHERE 
      "postsId"= $1 and
      "myStatus"='Like'`,
      [postId], 
    ); */
    result.likesCount = likesCount;
    const disLikes = await this.dataSource
      .getRepository(LikePosts)
      .createQueryBuilder('likePosts')
      .leftJoinAndSelect('likePosts.posts', 'posts')
      .where('posts.id=:postId', { postId })
      .where('likePosts.myStatus=:a', { a: 'Dislike' })
      .getCount();
    /* .query(
      `SELECT COUNT("postsId") as res3 FROM "likeposts" WHERE 
        "postsId"= $1 and
        "myStatus"='Dislike'`,
      [postId],
    ); */
    result.dislikesCount = disLikes;
    const my = await this.dataSource
      .getRepository(LikePosts)
      .createQueryBuilder('likeposts')
      .leftJoinAndSelect('likeposts.posts', 'posts')
      .where('posts.id=:postId', { postId })
      .leftJoinAndSelect('likeposts.users', 'users')
      .where('users.id=:userId', { userId })
      .getMany();
    /*   .query(
      `SELECT * FROM "likeposts" WHERE 
          "postsId"= $1 and
          "userId"=$2`,
      [postId, userId],
    ); */

    if (my.length === 0) {
      return result;
    } else {
      const a = my;
      result.myStatus = a[0].myStatus;
    }

    return result;
  }
  async getNewestLikes(postId: string): Promise<likePosts[]> {
    const result = await this.dataSource
      .getRepository(LikePosts)
      .createQueryBuilder('likeposts')
      .leftJoinAndSelect('likeposts.users', 'users')
      .leftJoinAndSelect('likeposts.posts', 'posts')
      .where('posts.id=:postId', { postId })
      .orderBy('adddedAt')
      .limit(3)
      .getMany();

    const result2 = result.map((v) => ({
      postsId: v.posts.id,
      userId: v.users.id,
      login: v.users.login,
      myStatus: v.myStatus,
      addedAt: v.addedAt,
    }));
    /*  query(
      `SELECT likeposts.*,login FROM "likeposts" 
      LEFT JOIN "users"
      ON users.id=likeposts."usersId"
    WHERE "postsId"=$1 and "myStatus"=$2 ORDER BY "addedAt" DESC`,
      [postId, 'Like'],
    ); */

    return result2;
  }

  async findLikeStatus(
    postId: string,
    userId: string,
  ): Promise<likePosts | null> {
    const result = await this.dataSource
      .getRepository(LikePosts)
      .createQueryBuilder('likePosts')
      .leftJoinAndSelect('likeposts:posts', 'posts')
      .where('likeposts.posts.id=:postId', { postId })
      .leftJoinAndSelect('likeposts.users', 'users')
      .where('likeposts.users.id=:userId', { userId })
      .getMany();
    if (result.length === 0) {
      return null;
    }
    const v = result;
    const res = {
      postId: v[0].posts.id,
      addedAt: v[0].addedAt,
      myStatus: v[0].myStatus,
      login: v[0].users.login,
      userId: v[0].users.id,
    };

    /* query(
      `SELECT likeposts.*,login FROM "likeposts" 
      LEFT JOIN "users"
      WHERE postId=$1 and "userId"=$2`,
      [postId, userId],
    ); */
    if (result.length === 0) {
      return null;
    }
    return res[0];
  }
}
