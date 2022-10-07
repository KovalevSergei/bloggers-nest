import { bloggersDBType, bloggersReturn, bloggersType } from './bloggers.type';

export interface IRepositoryBloggers {
  createBloggers: (bloggersnew: bloggersType) => Promise<bloggersType>;

  deleteBloggersById: (id: string) => Promise<boolean>;

  updateBloggers: (
    id: string,
    name: string,
    youtubeUrl: string,
  ) => Promise<boolean>;
}

export interface IRepositoryBloggersQuery {
  getBloggers: (
    pageSize: number,
    pageNumber: number,
    SearhName: string,
  ) => Promise<bloggersReturn>;

  getBloggersById: (id: string) => Promise<bloggersType | null>;
}
