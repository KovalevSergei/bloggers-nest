import { ObjectId, WithId } from 'mongodb';

export class postsType {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public bloggerId: string,
    public bloggerName: string,
    public addedAt: Date,
  ) {}
}

export class postsDBType {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,
    public items: postsType[],
  ) {}
}

export class postsreturn {
  constructor(public items: postsType[], public totalCount: number) {}
}
export type likePostWithId = WithId<likePosts>;
export class likePosts {
  constructor(
    public postsId: string,
    public userId: string,
    public login: string,
    public myStatus: string,
    public addedAt: Date,
  ) {}
}
