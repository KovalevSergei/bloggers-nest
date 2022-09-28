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
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class PostsRepository {
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
  async createPosts(postsnew: postsType): Promise<postsType> {
    const postsInstance = new this.postsModel();
    postsInstance.id = postsnew.id;

    postsInstance.title = postsnew.title;
    postsInstance.shortDescription = postsnew.shortDescription;
    postsInstance.content = postsnew.content;
    postsInstance.bloggerId = postsnew.bloggerId;
    postsInstance.bloggerName = postsnew.bloggerName;
    postsInstance.addedAt = postsnew.addedAt;

    await postsInstance.save();
    return postsnew;
  }
  async getpostsId(id: string): Promise<postsType | null> {
    return this.postsModel.findOne({ id: id }, { projection: { _id: 0 } });
  }
  async updatePostsId(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
  ): Promise<boolean | null> {
    const postsnew = await this.postsModel.updateOne(
      { id: id },
      {
        $set: {
          title: title,
          shortDescription: shortDescription,
          content: content,
        },
      },
    );
    return postsnew.modifiedCount === 1;
  }
  async deletePosts(id: string): Promise<boolean> {
    const result = await this.postsModel.deleteOne({ id: id });
    return result.deletedCount === 1;
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
  async getBloggersPost2(
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
  async createLikeStatus(likePostForm: likePosts): Promise<boolean> {
    const likeInstance = new this.likePostsModel();
    likeInstance.postsId = likePostForm.postsId;
    likeInstance.userId = likePostForm.userId;
    likeInstance.myStatus = likePostForm.myStatus;
    likeInstance.addedAt = likePostForm.addedAt;
    likeInstance.login = likePostForm.login;
    await likeInstance.save();
    return true;
  }
  async deleteLike(postId: string, userId: string): Promise<boolean> {
    const result = await this.likePostsModel.deleteOne({
      postsId: postId,
      userId: userId,
    });
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
  async getLikesBloggersPost(postsId: any): Promise<likePostWithId[]> {
    const result = await this.likePostsModel.find({
      myStatus: 'Like',
      postsId: { $in: postsId },
    });
    return result;
  }
  async getDislikeBloggersPost(postsId: any): Promise<likePostWithId[]> {
    const result = await this.likePostsModel.find({
      myStatus: 'Dislike',
      postsId: { $in: postsId },
    });
    return result;
  }
  async findLikeStatus(
    postId: string,
    userId: string,
  ): Promise<likePostWithId | null> {
    const result = await this.likePostsModel.findOne({
      postsId: postId,
      userId: userId,
    });
    return result;
  }
}
