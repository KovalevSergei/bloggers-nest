import { postsReturn } from './posts.repositoryMongoQuery';
import {
  likePosts,
  likePostWithId,
  postsreturn,
  postsType,
} from './posts.type';

export interface IPostsRepository {
  createPosts: (postsnew: postsType) => Promise<postsType>;
  updatePostsId: (
    id: string,
    title: string,
    shortDescription: string,
    content: string,
  ) => Promise<boolean | null>;
  deletePosts: (id: string) => Promise<boolean>;

  createLikeStatus: (likePostForm: likePosts) => Promise<boolean>;
  deleteLike: (postId: string, userId: string) => Promise<boolean>;
}

export interface IPostsRepositoryQuery {
  getPosts: (pageNumber: number, pageSize: number) => Promise<postsreturn>;

  getpostsId: (id: string) => Promise<postsType | null>;

  getBloggersPost: (
    bloggerId: string,
    pageSize: number,
    pageNumber: number,
  ) => Promise<postsReturn>;
  /*  getBloggersPost2: (
    bloggerId: string,
    pageSize: number,
    pageNumber: number,
  ) => Promise<postsReturn>; */

  getLikeStatus: (
    postId: string,
    userId: string,
  ) => Promise<{
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  }>;
  getNewestLikes: (postId: string) => Promise<likePosts[]>;
  //getLikesBloggersPost: (postsId: any) => Promise<likePosts[]>;
  //getDislikeBloggersPost: (postsId: any) => Promise<likePosts[]>;
  findLikeStatus: (postId: string, userId: string) => Promise<likePosts | null>;
}
