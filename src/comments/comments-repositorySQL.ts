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
export class CommentsRepository {
  constructor(
    @InjectModel(COMMENTS_COLLECTION)
    private commentsModel: Model<commentsDBType>,
    @InjectModel(LIKE_COMMENTS_COLLECTION)
    private likeCommentsModel: Model<likeCommentsWithId>,
  ) {}
  async updateComment(
    content: string,
    commentId: string,
    //userId: string,
  ): Promise<boolean | null> {
    const user = await this.commentsModel.findOne({ id: commentId });
    /*   if (!user) {
      return null;
    }
    if (user.userId === userId) {
      await commentsCollection.updateOne(
        { id: commentId },
        { $set: { content: content } }
      );
      return true;
    } else {
      return false;
    } */
    await this.commentsModel.updateOne(
      { id: commentId },
      { $set: { content: content } },
    );
    return true;
  }
  async getComment(id: string): Promise<commentsDBType | null> {
    return this.commentsModel.findOne(
      { id: id },
      { projection: { _id: 0, postId: 0 } },
    );
  }
  async deleteComment(id: string): Promise<boolean | null> {
    /*  const delComment = await commentsCollection.findOne({ id: id });
    if (delComment === null) {
      return false;
    }
    if (delComment.userId !== userId) {
      return null;
    } else { */
    const result = await this.commentsModel.deleteOne({ id: id });
    return result.deletedCount === 1;
  }
  async createComment(comment: commentsDBPostIdType): Promise<commentsDBType2> {
    await this.commentsModel.insertMany({ ...comment, _id: new ObjectId() });
    //const {postId,...rest}=comment
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
  async createLikeStatus(likeCommentForm: likeComments): Promise<boolean> {
    const likeInstance = new this.likeCommentsModel();
    likeInstance.commentsId = likeCommentForm.commentsId;
    likeInstance.userId = likeCommentForm.userId;
    likeInstance.myStatus = likeCommentForm.myStatus;
    likeInstance.addedAt = likeCommentForm.addedAt;
    likeInstance.login = likeCommentForm.login;
    await likeInstance.save();
    return true;
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
  async deleteLike(commentsId: string, userId: string): Promise<boolean> {
    const result = await this.likeCommentsModel.findOne({
      commentsId: commentsId,
      userId: userId,
    });
    if (!result) {
      return false;
    }
    await result.deleteOne();
    return true;
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
