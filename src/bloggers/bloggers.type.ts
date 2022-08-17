import { ObjectId, WithId } from 'mongodb';

export interface bloggersReturn {
  items: bloggersType[];
  totalCount: number;
}
export type bloggersWithIdType = WithId<bloggersType>;
export class bloggersDBType {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,
    public items: bloggersType[],
  ) {}
}
export type bloggersType = {
  id: string;
  name: string;
  youtubeUrl: string;
};
