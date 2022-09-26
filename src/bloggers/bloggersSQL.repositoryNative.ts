import { Inject, Injectable } from '@nestjs/common';
import { bloggersReturn, bloggersType } from './bloggers.type';
import { postsType } from '../posts/posts.type';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class BloggersRepository {
  constructor(@InjectDataSource() public dataSource: DataSource) {}

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
  async createBloggers(bloggersnew: bloggersType): Promise<bloggersType> {
    await this.dataSource.query(
      `INSERT INTO bloggers 
      ("id" ,"name","youtubeUrl") 
      VALUES ($1,$2,$3)`,
      [bloggersnew.id, bloggersnew.name, bloggersnew.youtubeUrl],
    );
    return bloggersnew;
  }
  async getBloggersById(id: string): Promise<bloggersType | null> {
    const res = await this.dataSource.query(
      `SELECT * FROM "bloggers" 
    WHERE id=$1`,
      [id],
    );
    return res[0];
  }
  async deleteBloggersById(id: string): Promise<boolean> {
    const bloggersInstance = await this.dataSource.query(
      `SELECT * FROM "bloggers"    
    WHERE id=$1`,
      [id],
    );
    if (bloggersInstance.length == 0) {
      return false;
    }
    await this.dataSource.query(`DELETE FROM "bloggers" WHERE id=$1`, [id]);

    return true;
  }
  async updateBloggers(
    id: string,
    name: string,
    youtubeUrl: string,
  ): Promise<boolean> {
    const bloggersInstance = await this.dataSource.query(
      `SELECT * FROM "bloggers"
    WHERE id=$1`,
      [id],
    );

    if (bloggersInstance.length === 0) {
      return false;
    }
    await this.dataSource.query(
      `UPDATE "bloggers" SET name=$2, "youtubeUrl"=$3
       WHERE id=$1`,
      [id, name, youtubeUrl],
    );

    return true;
  }
}
