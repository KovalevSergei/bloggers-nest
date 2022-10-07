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
import { IRepositoryComments } from './use-case/commentsRepository.interface';
interface commentReturn {
  items: commentsDBType[];
  totalCount: number;
}
@Injectable()
export class CommentsRepository implements IRepositoryComments {
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
    const a = await this.commentsModel.updateOne(
      { id: commentId },
      { $set: { content: content } },
    );
    return a.modifiedCount === 1;
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
}
