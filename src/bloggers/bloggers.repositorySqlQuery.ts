import { Injectable } from '@nestjs/common';
import { bloggersReturn, bloggersType } from './bloggers.type';
import { postsType } from 'src/posts/posts.type';
import { DataSource, Like } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Bloggers } from 'src/db.sql';
import {
  IRepositoryBloggers,
  IRepositoryBloggersQuery,
} from './bloggersRepository.interface';
interface postsReturn {
  items: postsType[];
  totalCount: number;
}
@Injectable()
export class BloggersRepositorySqlQuery implements IRepositoryBloggersQuery {
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
}
