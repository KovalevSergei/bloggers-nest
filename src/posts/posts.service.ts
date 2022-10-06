import { Injectable } from '@nestjs/common';
import { BloggersRepository } from '../bloggers/bloggersSQL.repository';
import { CommentsRepository } from '../comments/comments-repositorySQL';
import {
  commentDBTypePagination,
  commentsDBPostIdType,
  commentsDBType2,
} from 'src/comments/comments.type';
import { Posts } from '../db.sql';
import { UsersRepository } from '../users/users-repositorySQL';
import { UsersDBType } from '../users/users.type';
import { PostsRepository } from './posts.repositorySQL';
import {
  likePosts,
  likePostWithId,
  postsDBType,
  postsType,
} from './posts.type';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected bloggersRepository: BloggersRepository,
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
  ) {}
}
//protected usersRepository: UsersRepository){}
/*  async getPosts(pageNumber: number, pageSize: number): Promise<postsDBType> {
    const { items, totalCount } = await this.postsRepository.getPosts(
      pageNumber,
      pageSize,
    );

    let items2 = items.map((v) => ({
      id: v.id,
      title: v.title,
      shortDescription: v.shortDescription,
      content: v.content,
      bloggerId: v.bloggerId,
      bloggerName: v.bloggerName,
      addedAt: v.addedAt,
    }));
    let pagesCount = Number(Math.ceil(totalCount / pageSize));
    const result: postsDBType = new postsDBType(
      pagesCount,
      pageNumber,
      pageSize,
      totalCount,
      items2,
    );

    return result; */

// async createPosts(
//   title: string,
//   shortDescription: string,
//   content: string,
//   bloggerId: string,
// ): Promise<postsType | boolean> {
//   const nameblog = await this.bloggersRepository.getBloggersById(bloggerId);
//   if (nameblog) {
//     const postnew = {
//       id: Number(new Date()).toString(),
//       title: title,
//       shortDescription: shortDescription,
//       content: content,
//       bloggerId: bloggerId,
//       bloggerName: nameblog.name,
//       addedAt: new Date(),
//       //extendedLikesInfo: {
//       //likesCount: 0,
//       //dislikesCount: 0,
//       //myStatus: "None",
//       // newestLikes: [],},
//     };

//     await this.postsRepository.createPosts(postnew);
//     const postnew2 = {
//       id: postnew.id,
//       title: title,
//       shortDescription: shortDescription,
//       content: content,
//       bloggerId: bloggerId,
//       bloggerName: nameblog.name,
//       addedAt: postnew.addedAt,
//       extendedLikesInfo: {
//         likesCount: 0,
//         dislikesCount: 0,
//         myStatus: 'None',
//         newestLikes: [],
//       },
//     };

//     return postnew2;
//   } else {
//     return false;
//   }
// }
// async getpostsId(id: string): Promise<postsType | null> {
//   const v = await this.postsRepository.getpostsId(id);
//   if (!v) {
//     return null;
//   }
//   const result2 = {
//     id: v.id,
//     title: v.title,
//     shortDescription: v.shortDescription,
//     content: v.content,
//     bloggerId: v.bloggerId,
//     bloggerName: v.bloggerName,
//     addedAt: v.addedAt,
//   };
//   return result2;
// }
// async updatePostsId(
//   id: string,
//   title: string,
//   shortDescription: string,
//   content: string,
//   bloggerId: string,
// ): Promise<boolean | null> {
//   const nameblog = await this.bloggersRepository.getBloggersById(bloggerId);

//   if (!nameblog) {
//     return null;
//   } else {
//     return await this.postsRepository.updatePostsId(
//       id,
//       title,
//       shortDescription,
//       content,
//     );
//   }
// }
// async deletePosts(id: string): Promise<boolean> {
//   return this.postsRepository.deletePosts(id);
// }
/*   async getLike(
    postId: string,
    userId: string,
  ): Promise<{ likesCount: number; dislikesCount: number; myStatus: string }> {
    const result = await this.postsRepository.getLikeStatus(postId,userId);
    return result;
  }
  async getNewestLikes(postId: string): Promise<likePostWithId[]> {
    const result = await this.postsRepository.getNewestLikes(postId);
    return result;
  } */

// async createComments(
//   userId: string,
//   userLogin: string,
//   postId: string,
//   content: string,
// ): Promise<commentsDBType2> {
//   const commentNew: commentsDBPostIdType = {
//     id: Number(new Date()).toString(),
//     content: content,
//     userId: userId,
//     userLogin: userLogin,
//     addedAt: new Date().toString(),
//     postId: postId,
//   };
//   const result = await this.commentsRepository.createComment(commentNew);
//   const result2 = {
//     ...result,
//     likesInfo: {
//       likesCount: 0,
//       dislikesCount: 0,
//       myStatus: 'None',
//     },
//   };
//   return result2;
// }
// async updateLikePost(
//   postId: string,
//   userId: string,
//   status: string,
// ): Promise<boolean> {
//   const findLike = await this.postsRepository.findLikeStatus(postId, userId);
//   const login = await this.usersRepository.getUserById(userId);
//   const login2 = login as UsersDBType;
//   if (!findLike && status != 'None') {
//     const likePostForm = new likePosts(
//       postId,
//       userId,
//       login2.accountData.login,
//       status,
//       new Date(),
//     );
//     const result = await this.postsRepository.createLikeStatus(likePostForm);
//     return true;
//   }
//   if (findLike && status === 'None') {
//     await this.postsRepository.deleteLike(postId, userId);
//     return true;
//   }

//   if (findLike?.myStatus === status) {
//     return true;
//   } else {
//     await this.postsRepository.deleteLike(postId, userId);
//     const login = await this.usersRepository.getUserById(userId);
//     const login2 = login as UsersDBType;
//     const likePostForm = new likePosts(
//       postId,
//       userId,
//       login2.accountData.login,
//       status,
//       new Date(),
//     );
//     const result = await this.postsRepository.createLikeStatus(likePostForm);
//   }
//   return true;
// }
// async getLike(
//   postId: string,
//   userId: string,
// ): Promise<{ likesCount: number; dislikesCount: number; myStatus: string }> {
//   const result = await this.postsRepository.getLikeStatus(postId, userId);
//   return result;
// }
// async getNewestLikes(postId: string): Promise<likePosts[]> {
//   const result = await this.postsRepository.getNewestLikes(postId);
//   return result;
// }
// async getLike2(
//   commentsId: string,
//   userId: string,
// ): Promise<{ likesCount: number; dislikesCount: number; myStatus: string }> {
//   const result = await this.commentsRepository.getLikeStatus(
//     commentsId,
//     userId,
//   );
//   return result;
// }
/*   async getCommentsPost(
    pageSize: number,
    pageNumber: number,
    postId: string,
  ): Promise<commentDBTypePagination | boolean> {
    const { items, totalCount } = await this.commentsRepository.getCommentAll(
      pageSize,
      pageNumber,
      postId,
    );
    let pagesCount = Number(Math.ceil(totalCount / pageSize));
    const result: commentDBTypePagination = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: items,
    };
    return result;
  } */
