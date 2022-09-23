import { Inject, Injectable } from '@nestjs/common';
import { bloggersReturn, bloggersType } from './bloggers.type';
import { postsType } from 'src/posts/posts.type';
import { DataSource, Like } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Bloggers } from 'src/db.sql';
import { intlFormat } from 'date-fns';
import { validateSync } from 'class-validator';
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
    const totalCount = await this.dataSource
      .getRepository(Bloggers)
      .createQueryBuilder('bloggers')
      .where({ name: Like('%' || SearhName || '%') })
      .getCount();

    const pagination = (pageNumber - 1) * pageSize;
    const items = await this.dataSource
      .getRepository(Bloggers)
      .createQueryBuilder('bloggers')
      .where({ name: Like('%' || SearhName || '%') })
      .limit(pageSize)
      .offset(pagination)
      .getMany();

    /* query(
      `SELECT * FROM "bloggers"
        WHERE name LIKE ('%'||$1||'%')
        ORDER BY name DESC 
        LIMIT $2 OFFSET (($3 - 1) * $2)`,
      [SearhName || '', pageSize, pageNumber],
    ); */

    return {
      totalCount: totalCount,
      items: items,
    };
  }

  async createBloggers(bloggersnew: bloggersType): Promise<bloggersType> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Bloggers)
      .values({
        id: bloggersnew.id,
        name: bloggersnew.name,
        youtubeUrl: bloggersnew.youtubeUrl,
      })
      .execute();

    /*   query(
      `INSERT INTO bloggers 
      ("id" ,"name","youtubeUrl") 
      VALUES ($1,$2,$3)`,
      [bloggersnew.id, bloggersnew.name, bloggersnew.youtubeUrl],
    ); */
    return bloggersnew;
  }
  async getBloggersById(id: string): Promise<bloggersType | null> {
    const res = await this.dataSource
      .getRepository(Bloggers)
      .createQueryBuilder('bloggers')
      .select()
      .where('bloggers.id=:id', { id })
      .getOne();
    return res;

    /*    return this.dataSource.getRepository(Bloggers).findOne({ where: {
      id: id
    }}) */
  }
  async deleteBloggersById(id: string): Promise<boolean> {
    const bloggersInstance = await this.dataSource
      .getRepository(Bloggers)
      .createQueryBuilder('bloggers')
      .where('bloggers.id=:id', { id })
      .getOne();

    /*     query(
      `SELECT * FROM "bloggers"    
    WHERE id=$1`,
      [id],
    ); */
    if (bloggersInstance === null) {
      return false;
    }
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Bloggers)
      .where('bloggers.id=:id', { id })
      .execute();

    return true;
  }
  async updateBloggers(
    id: string,
    name: string,
    youtubeUrl: string,
  ): Promise<boolean> {
    const bloggersInstance = await this.dataSource
      .getRepository(Bloggers)
      .createQueryBuilder('bloggers')
      .where('bloggers.id=:id', { id })
      .getOne();

    if (bloggersInstance === null) {
      return false;
    }
    await this.dataSource
      .createQueryBuilder()
      .update(Bloggers)
      .set({ name: name, youtubeUrl: youtubeUrl })
      .where('bloggers.id=:id', { id })
      .execute();
    /*     
    query(
      `UPDATE "bloggers" SET name=$2, "youtubeUrl"=$3
       WHERE id=$1`,
      [id, name, youtubeUrl],
    ); */

    return true;
  }
}
