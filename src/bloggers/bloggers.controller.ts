import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BloggersService } from './bloggers.service';

@Controller('bloggers')
export class BloggersController {
  constructor(protected bloggersService: BloggersService) {}
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
  async createBloggers(
    @Body('name') name: string,
    @Body('youtubeUrl') youtubeUrl: string,
  ) {
    const bloggersnew = await this.bloggersService.createBloggers(
      name,
      youtubeUrl,
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
}
