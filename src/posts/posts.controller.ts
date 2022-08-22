import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsIn, IsNotEmpty, isString, Length } from 'class-validator';
import { NOTFOUND } from 'dns';
import { CommentsService } from 'src/comments/comments-service';
import { commentDBTypePagination } from 'src/comments/comments.type';
import { PostsService } from './posts.service';
let status = ['None', 'Like', 'Dislike'];
class likeStatus {
  @IsIn(status)
  status: string;
}
class UpdatePosts {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 30)
  title: string;
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 100)
  shortDescription: string;
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 1000)
  content: string;
  @IsNotEmpty()
  bloggerId: string;
}

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService, //protected commentsServise: CommentsService,
  ) {}
  @Get()
  async getPosts(
    @Query('PageNumber') pageNumber: number,
    @Query('PageSize') pageSize: number,
    // @Req() user: any,
  ) {
    const getPosts = await this.postsService.getPosts(
      pageNumber || 1,
      pageSize || 10,
    );
    const userId = '12';

    const itemsPost = getPosts.items;
    const items3 = [];

    for (let i = 0; i < itemsPost.length; i++) {
      const postId = itemsPost[i].id;
      const likesInformation = await this.postsService.getLike(postId, userId);
      const newestLikes = await this.postsService.getNewestLikes(postId);
      const newestLikesMap = newestLikes.map((v) => ({
        addedAt: v.addedAt,
        userId: v.userId,
        login: v.login,
      }));
      const a = {
        id: itemsPost[i].id,
        title: itemsPost[i].title,
        shortDescription: itemsPost[i].shortDescription,
        content: itemsPost[i].content,
        bloggerId: itemsPost[i].bloggerId,
        bloggerName: itemsPost[i].bloggerName,
        addedAt: itemsPost[i].addedAt,
        extendedLikesInfo: {
          likesCount: likesInformation.likesCount,
          dislikesCount: likesInformation.dislikesCount,
          myStatus: likesInformation.myStatus,
          newestLikes: newestLikesMap,
        },
      };
      items3.push(a);
    }

    const result = {
      pagesCount: getPosts.pagesCount,
      page: getPosts.page,
      pageSize: getPosts.pageSize,
      totalCount: getPosts.totalCount,
      items: items3,
    };

    return result;
  }
  @Post()
  @HttpCode(201)
  async createPosts(@Body() body: UpdatePosts) {
    const postnew = await this.postsService.createPosts(
      body.title,
      body.shortDescription,
      body.content,
      body.bloggerId,
    );
    if (postnew) {
      return postnew;
    } else {
      throw new BadRequestException({
        message: {
          errorsMessages: [{ message: 'bloger', field: 'bloggerId' }],
        },
      });
    }
  }
  @Get(':postId')
  async getpostsId(@Param('postId') postId: string) {
    const postsid = await this.postsService.getpostsId(postId);
    //const userId = req.user?.id || "1";
    if (!postsid) {
      throw new NotFoundException();
    } else {
      /* const likesInformation = await this.postsServis.getLike(
        postId,
        userId
      );
      const newestLikes = await this.postsServis.getNewestLikes(
        req.params.postsId
      );
      const newestLikesMap = newestLikes.map((v) => ({
        addedAt: v.addedAt,
        userId: v.userId,
        login: v.login,
      }));

      const result = {
        id: postsid.id,
        title: postsid.title,
        shortDescription: postsid.shortDescription,
        content: postsid.content,
        bloggerId: postsid.bloggerId,
        bloggerName: postsid.bloggerName,
        addedAt: postsid.addedAt,
        extendedLikesInfo: {
          likesCount: likesInformation.likesCount,
          dislikesCount: likesInformation.dislikesCount,
          myStatus: likesInformation.myStatus,
          newestLikes: newestLikesMap,
        },
      };
     return result;
    } */

      return postsid;
    }
  }
  @Put(':id')
  @HttpCode(204)
  async updatePostsId(@Body() body: UpdatePosts, @Param('id') id: string) {
    const postsnew = await this.postsService.updatePostsId(
      id,
      body.title,
      body.shortDescription,
      body.content,
      body.bloggerId,
    );
    if (postsnew === false) {
      throw new NotFoundException();
    } else if (postsnew === null) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'bloger', field: 'bloggerId' }],
      });
      //.status(400)
      //.send({ errorsMessages: [{ message: "bloger", field: "bloggerId" }] });
    } else {
      return postsnew;
    }
  }
  @Delete(':id')
  @HttpCode(204)
  async deletePosts(@Param('id') id: string) {
    const isdelete = await this.postsService.deletePosts(id);
    if (isdelete) {
      return;
    } else {
      throw new NotFoundException();
    }
  }
  @Post(':postId/comments')
  async createComments(
    @Param('postId') postId: string,
    @Body('content') content: string,
  ) {
    //const userId = req.user?.id;
    //const userLogin = req.user?.accountData.login;
    const userId = '12';
    const userLogin = 'pety';
    if (!userId || !userLogin) {
      throw new UnauthorizedException();
    }

    const findPost = await this.postsService.getpostsId(postId);
    if (!findPost) {
      throw new NotFoundException();
    } else {
      const newComment = await this.postsService.createComments(
        userId,
        userLogin,
        postId,
        content,
      );
      return newComment;
    }
  }
  @Get(':postId/comments')
  async getCommentsPost(
    @Param('postId') postId: string,
    @Query('PageSize') pageSize: number,
    @Query('PageNumber') pageNumber: number,
  ) {
    // const userId = req.user?.id || "1";
    const userId = '12';
    const post = await this.postsService.getpostsId(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const getComment = await this.postsService.getCommentsPost(
      pageSize || 10,
      pageNumber || 1,
      postId,
    );
    console.log(getComment);

    const Comment = getComment as commentDBTypePagination;
    const items4 = [];
    for (let i = 0; i < Comment.items.length; i++) {
      const commentId = Comment.items[i].id;
      const likesInformation = await this.postsService.getLike2(
        commentId,
        userId,
      );
      const a = {
        id: Comment.items[i].id,
        content: Comment.items[i].content,
        userId: Comment.items[i].userId,
        userLogin: Comment.items[i].userLogin,
        addedAt: Comment.items[i].addedAt,
        likesInfo: {
          likesCount: likesInformation.likesCount,
          dislikesCount: likesInformation.dislikesCount,
          myStatus: likesInformation.myStatus,
        },
      };
      items4.push(a);
    }
    const result = {
      pagesCount: Comment.pagesCount,
      page: Comment.page,
      pageSize: Comment.pageSize,
      totalCount: Comment.totalCount,
      items: items4,
    };
    return result;
  }
  @Put(':postId/like-status')
  @HttpCode(204)
  async updateLikePosts(
    @Param('postId') postId: string,
    @Body() body: likeStatus,
  ) {
    //const userId = req.user?.id || "1";
    const userId = '12';
    const postById = await this.postsService.getpostsId(postId);
    if (!postById) {
      throw new NotFoundException();
    }
    const result = await this.postsService.updateLikePost(
      postId,
      userId,
      body.status,
    );
    return;
  }
}
