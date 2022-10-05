import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { COMMENTS_COLLECTION, LIKE_COMMENTS_COLLECTION } from '../db';
import {
  commentsDBPostIdType,
  commentsDBType,
  commentsDBType2,
  likeComments,
  likeCommentsWithId,
} from './comments.type';
import { ObjectId } from 'mongodb';
interface commentReturn {
  items: commentsDBType[];
  totalCount: number;
}
@Injectable()
export class CommentsRepositoryQuery {
  constructor(
    @InjectModel(COMMENTS_COLLECTION)
    private commentsModel: Model<commentsDBType>,
    @InjectModel(LIKE_COMMENTS_COLLECTION)
    private likeCommentsModel: Model<likeCommentsWithId>,
  ) {}
  async getComment(id: string): Promise<commentsDBType | null> {
    return this.commentsModel.findOne(
      { id: id },
      { projection: { _id: 0, postId: 0 } },
    );
  }

  async getCommentAll(
    pageSize: number,
    pageNumber: number,
    postId: string,
  ): Promise<commentReturn> {
    const totalCount = await this.commentsModel.countDocuments({
      postId: postId,
    });

    const items = await this.commentsModel
      .find({ postId: postId }, { projection: { _id: 0, postId: 0 } })
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .lean();

    return { items: items, totalCount: totalCount };
  }

  async findLikeStatus(
    commentsId: string,
    userId: string,
  ): Promise<likeCommentsWithId | null> {
    const result = await this.likeCommentsModel.findOne({
      commentsId: commentsId,
      userId: userId,
    });

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
    const likesCount = await this.likeCommentsModel.countDocuments({
      commentsId: commentsId,
      myStatus: 'Like',
    });
    result.likesCount = likesCount;
    const disLikes = await this.likeCommentsModel.countDocuments({
      commentsId: commentsId,
      myStatus: 'Dislike',
    });
    result.dislikesCount = disLikes;
    const my = await this.likeCommentsModel.findOne({
      commentsId: commentsId,
      userId: userId,
    });

    if (!my) {
      return result;
    } else {
      const a = my;
      result.myStatus = a.myStatus;
    }

    return result;
  }
}
