import { Inject, Injectable } from '@nestjs/common';
import { bloggersDBType, bloggersReturn, bloggersType } from './bloggers.type';
import { BloggersModel, BLOGGERS_COLLECTION, POSTS_COLLECTION } from '../db';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { postsType } from '../posts/posts.type';
import { ObjectId } from 'mongodb';
import { PostsService } from '../posts/posts.service';
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class BloggersRepositoryQuery {
  constructor(
    @InjectModel(BLOGGERS_COLLECTION)
    private bloggersModel: Model<bloggersType>,
  ) {}

  async getBloggers(
    pageSize: number,
    pageNumber: number,
    SearhName: string,
  ): Promise<bloggersDBType> {
    const filterQuery: FilterQuery<bloggersType> = {};

    if (SearhName) {
      filterQuery.name = { $regex: SearhName };
    }

    const totalCount = await this.bloggersModel.count(filterQuery);

    const items = await this.bloggersModel
      .find(filterQuery, { projection: { _id: 0 } })
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .lean();
    let items2 = items.map((v) => ({
      id: v.id,
      name: v.name,
      youtubeUrl: v.youtubeUrl,
    }));
    let pagesCount = Number(Math.ceil(totalCount / pageSize));
    const result: bloggersDBType = new bloggersDBType(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      items2,
    );

    return result;
  }

  async getBloggersById(id: string): Promise<bloggersType | null> {
    const bloggers = await this.bloggersModel.findOne(
      { id: id },
      { projection: { _id: 0 } },
    );
    if (!bloggers) {
      return null;
    } else {
      const bloggers2 = {
        id: bloggers.id,
        name: bloggers.name,
        youtubeUrl: bloggers.youtubeUrl,
      };
      return bloggers2;
    }
  }
}
