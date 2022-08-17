import { Injectable } from '@nestjs/common';
import { BloggersRepository } from './bloggers.repository';
import { bloggersDBType } from './bloggers.type';

@Injectable()
export class BloggersService {
  constructor(protected bloggersRepository: BloggersRepository) {}
  async getBloggers(
    pageSize: number,
    pageNumber: number,
    SearhName: string,
  ): Promise<bloggersDBType> {
    const { items, totalCount } = await this.bloggersRepository.getBloggers(
      pageSize,
      pageNumber,
      SearhName,
    );
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
}
