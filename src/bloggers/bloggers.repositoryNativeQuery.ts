import { Injectable } from '@nestjs/common';
import { bloggersReturn, bloggersType } from './bloggers.type';
import { postsType } from '../posts/posts.type';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  IRepositoryBloggers,
  IRepositoryBloggersQuery,
} from './bloggersRepository.interface';
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class BloggersRepositoryNativeQuery implements IRepositoryBloggersQuery {
  constructor(@InjectDataSource('Native') public dataSource: DataSource) {}

  async getBloggers(
    pageSize: number,
    pageNumber: number,
    SearhName: string,
  ): Promise<bloggersReturn> {
    //const filterQuery: FilterQuery<bloggersType> = {};

    /*  if (SearhName) {
      filterQuery.name = { $regex: SearhName };
    }

    const totalCount = await this.bloggersModel.count(filterQuery);

    const items = await this.bloggersModel
      .find(filterQuery, { projection: { _id: 0 } })
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .lean(); */
    const totalCount = await this.dataSource.query(
      `SELECT COUNT(id) 
      FROM "bloggers"
       WHERE name LIKE ('%'||$1||'%') `,
      [SearhName || ''],
    );
    const items = await this.dataSource.query(
      `SELECT * FROM "bloggers"
        WHERE name LIKE ('%'||$1||'%')
        ORDER BY name DESC 
        LIMIT $2 OFFSET (($3 - 1) * $2)`,
      [SearhName || '', pageSize, pageNumber],
    );

    return {
      totalCount: +totalCount[0].count,
      items: items,
    };
  }

  async getBloggersById(id: string): Promise<bloggersType | null> {
    const res = await this.dataSource.query(
      `SELECT * FROM "bloggers" 
    WHERE id=$1`,
      [id],
    );

    return res[0];
  }
}
