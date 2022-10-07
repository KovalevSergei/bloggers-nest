import { Injectable } from '@nestjs/common';
import { bloggersReturn, bloggersType } from './bloggers.type';
import { postsType } from '../posts/posts.type';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IRepositoryBloggers } from './bloggersRepository.interface';
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class BloggersRepositoryNative implements IRepositoryBloggers {
  constructor(@InjectDataSource('Native') public dataSource: DataSource) {}

  async createBloggers(bloggersnew: bloggersType): Promise<bloggersType> {
    await this.dataSource.query(
      `INSERT INTO bloggers 
      ("id" ,"name","youtubeUrl") 
      VALUES ($1,$2,$3)`,
      [bloggersnew.id, bloggersnew.name, bloggersnew.youtubeUrl],
    );
    return bloggersnew;
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
