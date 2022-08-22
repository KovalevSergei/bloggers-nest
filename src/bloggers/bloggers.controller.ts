import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MESSAGES } from '@nestjs/core/constants';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { title } from 'process';
import { AuthBasic } from 'src/guards/auth.guards';
import { postsType } from 'src/posts/posts.type';
import { BloggersService } from './bloggers.service';

class UpdateBloggers {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 15)
  name: string;
  @IsString()
  @IsUrl(undefined, { message: 'Company Url is not valid.' })
  youtubeUrl: string;
}

@Controller('bloggers')
export class BloggersController {
  constructor(protected bloggersService: BloggersService) {}
  @UseGuards(AuthBasic)
  @Get()
  async getBloggers(
    @Query('pageSize') pageSize: number,
    @Query('pageNumber') pageNumber: number,
    @Query('SearchNameTerm') SearchNameTerm?: string,
  ) {
    /* const pageSize: number = Number(req.query.PageSize) || 10;
    const pageNumber = Number(req.query.PageNumber) || 1;
    const SearhName = req.query.SearchNameTerm || ""; */
    const SearhName = SearchNameTerm;
    if (typeof SearhName === 'string' || !SearhName) {
      const getBloggers = await this.bloggersService.getBloggers(
        pageSize || 10,
        pageNumber || 1,
        SearhName,
      );

      return getBloggers;
    }
    // res.sendStatus(400);
    return new BadRequestException();
  }

  @Post()
  async createBloggers(@Body() body: UpdateBloggers) {
    const bloggersnew = await this.bloggersService.createBloggers(
      body.name,
      body.youtubeUrl,
    );
    return bloggersnew;
  }
  @Get(':bloggersId')
  async getBloggersById(@Param() params: { bloggersId: string }) {
    const blog = await this.bloggersService.getBloggersById(params.bloggersId);
    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
    /* if (blog) {
    res.status(200).json(blog);
  } else {
    res.sendStatus(404);
  } */
  }
  @Delete(':bloggersId')
  @HttpCode(204)
  async deleteBloggersById(@Param() params: { bloggersId: string }) {
    const bloggerdel = await this.bloggersService.deleteBloggersById(
      params.bloggersId,
    );
    if (bloggerdel === false) {
      throw new NotFoundException();
    } else {
      return;
    }
  }
  @Put(':id')
  @HttpCode(204)
  async updateBloggers(
    @Param() params: { id: string },
    @Body() body: UpdateBloggers,
  ) {
    const bloggersnew = await this.bloggersService.updateBloggers(
      params.id,
      body.name,
      body.youtubeUrl,
    );

    if (bloggersnew) {
      return;
    } else {
      throw new NotFoundException();
    }
  }
  @Post(':bloggerId/posts')
  async createBloggersPost(
    @Param('bloggerId') bloggerId: string,
    @Body('title') title: string,
    @Body('shortDescription') shortDescription: string,
    @Body('content') content: string,
  ) {
    const bloggersnew = await this.bloggersService.createBloggersPost(
      bloggerId,
      title,
      shortDescription,
      content,
    );

    if (bloggersnew === false) {
      throw new NotFoundException("If specific blogger doesn't exists");
    } else {
      const a = bloggersnew as postsType;
      const result = {
        id: a.id,
        title: a.title,
        shortDescription: a.shortDescription,
        content: a.content,
        bloggerId: a.bloggerId,
        bloggerName: a.bloggerName,
        addedAt: a.addedAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      };
      return result;
    }
  }
  @Get(':id/posts')
  async getBloggersPost(
    @Query('PageSize') PageSize: number,
    @Query('PageNumber') PageNumber: number,
    @Param('id') id: string,
  ) {
    //const userId = req.user?.id || "1";

    const getPostBlogger = await this.bloggersService.getBloggersPost(
      id,
      PageSize,
      PageNumber,
      // userId
    );
    if (getPostBlogger === false) {
      throw new NotFoundException('If specific blogger is not exists');
    } else {
      return getPostBlogger;
    }
  }
}
