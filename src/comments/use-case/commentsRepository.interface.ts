import { commentReturn } from '../comments-repositoryMongoQuery';
import {
  commentsDBPostIdType,
  commentsDBType,
  commentsDBType2,
  likeComments,
  likeCommentsWithId,
} from '../comments.type';

export interface IRepositoryComments {
  updateComment: (
    content: string,
    commentId: string,
    //userId: string,
  ) => Promise<boolean | null>;
  deleteComment: (id: string) => Promise<boolean | null>;
  createComment: (comment: commentsDBPostIdType) => Promise<commentsDBType2>;
  createLikeStatus: (likeCommentForm: likeComments) => Promise<boolean>;
  deleteLike: (commentsId: string, userId: string) => Promise<boolean>;
}

export interface IRepositoryCommentsQuery {
  getComment: (id: string) => Promise<commentsDBType | null>;

  getCommentAll: (
    pageSize: number,
    pageNumber: number,
    postId: string,
  ) => Promise<commentReturn>;

  findLikeStatus: (
    commentsId: string,
    userId: string,
  ) => Promise<likeCommentsWithId | null>;

  getLikeStatus: (
    commentsId: string,
    userId: string,
  ) => Promise<{
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  }>;
}
