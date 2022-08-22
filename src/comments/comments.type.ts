import { ObjectId, WithId } from 'mongodb';

export type commentsDBType = {
  id: string;
  postId: string;
  content: string;
  userId: string;
  userLogin: string;
  addedAt: string;
};
export type commentsDBType2 = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  addedAt: string;
};

export type commentDBTypePagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: commentsDBType[];
};

export type commentsDBPostIdType = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  addedAt: string;
  postId: string;
};
export type likeCommentsWithId = WithId<likeComments>;

export class likeComments {
  constructor(
    public commentsId: string,
    public userId: string,
    public login: string,
    public myStatus: string,
    public addedAt: Date,
  ) {}
}
