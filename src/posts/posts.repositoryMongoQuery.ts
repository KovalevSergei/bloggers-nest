import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { POSTS_COLLECTION } from '../db';
import {
  likePosts,
  likePostWithId,
  postsreturn,
  postsType,
} from './posts.type';
import { ObjectId } from 'mongodb';
import { IPostsRepositoryQuery } from './postsRepository.interface';
export interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class PostsRepositoryQuery implements IPostsRepositoryQuery {
  constructor(
    @InjectModel(POSTS_COLLECTION)
    private postsModel: Model<postsType>,
    @InjectModel(POSTS_COLLECTION)
    private likePostsModel: Model<likePostWithId>,
  ) {}
  async getPosts(pageNumber: number, pageSize: number): Promise<postsreturn> {
    const posts = await this.postsModel
      .find({}, { projection: { _id: 0 } })
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .lean();
    const totalCount = await this.postsModel.countDocuments();
    return {
      totalCount: totalCount,
      items: posts,
    };
  }

  //!!!!!!!!!!!!Используется
  async getpostsId(id: string): Promise<postsType | null> {
    const v = await this.postsModel.findOne(
      { id: id },
      { projection: { _id: 0 } },
    );
    if (!v) {
      return null;
    }
    const result2 = {
      id: v.id,
      title: v.title,
      shortDescription: v.shortDescription,
      content: v.content,
      bloggerId: v.bloggerId,
      bloggerName: v.bloggerName,
      addedAt: v.addedAt,
    };
    return result2;
  }

  async getBloggersPost(
    bloggerId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<postsReturn> {
    const postsBloggerId = await this.postsModel
      .find({ bloggerId: bloggerId })
      .lean();
    const totalCount = postsBloggerId.length;

    const items = await this.postsModel
      .find({ bloggerId: bloggerId }, { projection: { _id: 0 } })
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .lean();
    return {
      totalCount: totalCount,
      items: items,
    };
  }
  /*   async getBloggersPost2(
    bloggerId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<postsReturn> {
    const postsBloggerId = await this.postsModel
      .find({ bloggerId: bloggerId })
      .lean();
    const totalCount = postsBloggerId.length;

    const items = await this.postsModel
      .find({ bloggerId: bloggerId }, { projection: { _id: 0 } })
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .lean();
    return {
      totalCount: totalCount,
      items: items,
    };
  } */

  async getLikeStatus(
    postId: string,
    userId: string,
  ): Promise<{
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  }> {
    const result = { likesCount: 0, dislikesCount: 0, myStatus: 'None' };
    const likesCount = await this.likePostsModel.countDocuments({
      postsId: postId,
      myStatus: 'Like',
    });

    result.likesCount = likesCount;
    const disLikes = await this.likePostsModel.countDocuments({
      postsId: postId,
      myStatus: 'Dislike',
    });

    result.dislikesCount = disLikes;
    const my = await this.likePostsModel.findOne({
      postsId: postId,
      userId: userId,
    });

    if (my === null) {
      return result;
    } else {
      const a = my as likePostWithId;
      result.myStatus = a.myStatus;
    }

    return result;
  }
  async getNewestLikes(postId: string): Promise<likePosts[]> {
    const result2 = await this.likePostsModel
      .find({ postsId: postId, myStatus: 'Like' })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
    const result = [];
    for (let i = 0; i < result2.length; i++) {
      const a = {
        postsId: result2[i].postsId,
        userId: result2[i].userId,
        login: result2[i].login,
        myStatus: result2[i].myStatus,
        addedAt: result2[i].addedAt,
      };
      result.push(a);
    }

    return result;
  }
  // async getLikesBloggersPost(postsId: any): Promise<likePosts[]> {
  //   const result = await this.likePostsModel.find(
  //     {
  //       myStatus: 'Like',
  //       postsId: { $in: postsId },
  //     },
  //     { projection: { _id: 0 } },
  //   );
  //   return result;
  // }
  // async getDislikeBloggersPost(postsId: any): Promise<likePosts[]> {
  //   const result = await this.likePostsModel.find(
  //     {
  //       myStatus: 'Dislike',
  //       postsId: { $in: postsId },
  //     },
  //     { projection: { _id: 0 } },
  //   );
  //   return result;
  // }
  async findLikeStatus(
    postId: string,
    userId: string,
  ): Promise<likePosts | null> {
    const result = await this.likePostsModel.findOne(
      {
        postsId: postId,
        userId: userId,
      },
      { projection: { _id: 0 } },
    );
    return result;
  }
}
