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
  UseGuards,
} from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  isString,
  IsUrl,
  Length,
} from 'class-validator';
import { NOTFOUND } from 'dns';
import { CommentsService } from '../comments/comments-service';
import { commentDBTypePagination } from '../comments/comments.type';
import { Auth } from '../guards/Auth';
import { AuthBasic } from '../guards/authBasic.guards';
import { PostsService } from './posts.service';
import { Request } from 'express';
import { UsersDBTypeWithId } from '../users/users.type';
import { UserId } from '../guards/userId';
let status = ['None', 'Like', 'Dislike'];
type RequestWithUser = Request & { user: UsersDBTypeWithId };
class likeStatus {
  @IsIn(status)
  likeStatus: string;
}

class CommonBlogger {
  @IsString()
  name: string;
  @IsUrl()
  youtubeUrl: string;
}

class BloggerWithSurname extends CommonBlogger {
  @IsString()
  surname: string;
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
class CommentsUpdate {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(20, 300)
  content: string;
}

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService, //protected commentsServise: CommentsService,
  ) {}
  @UseGuards(UserId)
  @Get()
  async getPosts(
    @Query('PageNumber') pageNumber: number,
    @Query('PageSize') pageSize: number,
    @Req() req: RequestWithUser,
  ) {
    const getPosts = await this.postsService.getPosts(
      pageNumber || 1,
      pageSize || 10,
    );
    const userId = req.user?.id;

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
  @UseGuards(AuthBasic)
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
  @UseGuards(UserId)
  @Get(':postId')
  async getpostsId(
    @Param('postId') postId: string,
    @Req() req: RequestWithUser,
  ) {
    const postsid = await this.postsService.getpostsId(postId);
    const userId = req.user?.id;
    if (!postsid) {
      throw new NotFoundException();
    } else {
      const likesInformation = await this.postsService.getLike(postId, userId);
      const newestLikes = await this.postsService.getNewestLikes(
        req.params.postsId,
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
    }
  }
  @UseGuards(AuthBasic)
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
    } else {
      return postsnew;
    }
  }
  @UseGuards(AuthBasic)
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
  @UseGuards(Auth)
  @Post(':postId/comments')
  async createComments(
    @Param('postId') postId: string,
    @Body() body2: CommentsUpdate,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    const userLogin = req.user?.accountData.login;
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
        body2.content,
      );
      return newComment;
    }
  }
  @UseGuards(UserId)
  @Get(':postId/comments')
  async getCommentsPost(
    @Param('postId') postId: string,
    @Query('PageSize') pageSize: number,
    @Query('PageNumber') pageNumber: number,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    const post = await this.postsService.getpostsId(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const getComment = await this.postsService.getCommentsPost(
      pageSize || 10,
      pageNumber || 1,
      postId,
    );
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
  @UseGuards(Auth)
  @Put(':postId/like-status')
  @HttpCode(204)
  async updateLikePosts(
    @Param('postId') postId: string,
    @Body() body: likeStatus,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id || '1';

    const postById = await this.postsService.getpostsId(postId);
    if (!postById) {
      throw new NotFoundException();
    }
    const result = await this.postsService.updateLikePost(
      postId,
      userId,
      body.likeStatus,
    );
    return;
  }
}
