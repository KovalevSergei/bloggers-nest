import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { bloggersType } from '../bloggers/bloggers.type';
import { commentsDBType, likeCommentsWithId } from '../comments/comments.type';
import {
  BLOGGERS_COLLECTION,
  COMMENTS_COLLECTION,
  LIKE_COMMENTS_COLLECTION,
  POSTS_COLLECTION,
  USERS_COLLECTION,
} from '../db';
import { likePostWithId, postsType } from '../posts/posts.type';
import { UsersDBType } from '../users/users.type';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(BLOGGERS_COLLECTION)
    private bloggersModel: Model<bloggersType>,
    @InjectModel(USERS_COLLECTION)
    private usersModel: Model<UsersDBType>,
    @InjectModel(COMMENTS_COLLECTION)
    private commentsModel: Model<commentsDBType>,
    @InjectModel(LIKE_COMMENTS_COLLECTION)
    private likeCommentsModel: Model<likeCommentsWithId>,
    @InjectModel(POSTS_COLLECTION)
    private postsModel: Model<postsType>,
    @InjectModel(POSTS_COLLECTION)
    private likePostsModel: Model<likePostWithId>,
  ) {}
  async deleteAll(): Promise<boolean> {
    await this.bloggersModel.deleteMany({});
    await this.usersModel.deleteMany({});
    await this.commentsModel.deleteMany({});
    //await tokenModel.deleteMany({});
    await this.postsModel.deleteMany({});
    // await ipModel.deleteMany({});
    await this.likeCommentsModel.deleteMany({});
    await this.likePostsModel.deleteMany({});
    return true;
  }
}
