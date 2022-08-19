import { Inject, Injectable } from '@nestjs/common';
import { bloggersReturn, bloggersType } from './bloggers.type';
import { BloggersModel, BLOGGERS_COLLECTION } from 'src/db';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BloggersRepository {
  constructor(
    @InjectModel(BLOGGERS_COLLECTION)
    private bloggersModel: Model<bloggersType>,
  ) {}

  async getBloggers(
    pageSize: number,
    pageNumber: number,
    SearhName: string,
  ): Promise<bloggersReturn> {
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

    return {
      totalCount: totalCount,
      items: items,
    };
  }
  async createBloggers(bloggersnew: bloggersType): Promise<bloggersType> {
    const bloggersInstance = new this.bloggersModel();
    bloggersInstance.id = bloggersnew.id;
    bloggersInstance.name = bloggersnew.name;
    bloggersInstance.youtubeUrl = bloggersnew.youtubeUrl;

    await bloggersInstance.save();

    /*    const bloggersNew = await bloggersModel.insertMany({
      ...bloggersnew,
      _id: new ObjectId(),
    }); */

    return bloggersnew;
  }
  async getBloggersById(id: string): Promise<bloggersType | null> {
    return this.bloggersModel.findOne({ id: id }, { projection: { _id: 0 } });
  }
}
