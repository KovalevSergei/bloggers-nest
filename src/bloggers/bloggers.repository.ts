import { Inject, Injectable } from '@nestjs/common';
import { bloggersReturn, bloggersType } from './bloggers.type';
import { BloggersModel } from 'src/main';
import { Model } from 'mongoose';

@Injectable()
export class BloggersRepository {
  constructor(
    @Inject('BloggersModel')
    private bloggersModel: Model<bloggersType>,
  ) {}

  async getBloggers(
    pageSize: number,
    pageNumber: number,
    SearhName: string,
  ): Promise<bloggersReturn> {
    const totalCount = await this.bloggersModel.countDocuments({
      name: { $regex: SearhName },
    });

    const items = await this.bloggersModel
      .find({ name: { $regex: SearhName } }, { projection: { _id: 0 } })
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .lean();

    return {
      totalCount: totalCount,
      items: items,
    };
  }
}
