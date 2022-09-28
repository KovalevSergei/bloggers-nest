import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, Length } from 'class-validator';
import { NotFoundError } from 'rxjs';
import { Auth } from '../guards/Auth';
import { UserFind } from '../guards/userFind';
import { UserId } from '../guards/userId';
import { UsersDBTypeWithId } from '../users/users.type';
import { CommentsService } from './comments-service';
type RequestWithUser = Request & { user: UsersDBTypeWithId };
let status2 = ['None', 'Like', 'Dislike'];
class like {
  @IsIn(status2)
  likeStatus: string;
}
class CommetnsUpdate {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 1000)
  content: string;
}
@Controller('comments')
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}
  @UseGuards(Auth)
  @UseGuards(UserId)
  @Put(':commentId')
  @HttpCode(204)
  async updateContent(
    @Param('commentId') commentId: string,
    @Body() body: CommetnsUpdate,
    @Req() req: RequestWithUser,
  ) {
    const commentById = await this.commentsService.getComment(commentId);
    const userId = req.user?.id || '1';
    ///const useriD = req.user?.id || "1";
    if (commentById.userId !== userId) {
      throw new ForbiddenException();
    }
    const contentnew = await this.commentsService.updateContent(
      body.content,
      commentId,
      // useriD
    );
    if (contentnew) {
      return;
    } else {
      throw new NotFoundException('Comment Not Found');
    }
  }
  @UseGuards(UserId)
  @Get(':commentId')
  async getCommentById(
    @Param('commentId') commentId: string,
    @Req() req: RequestWithUser,
  ) {
    const commentById = await this.commentsService.getComment(commentId);
    const userId = req.user?.id || '1';

    if (!commentById) {
      throw new NotFoundException();
    } else {
      const likesInformation = await this.commentsService.getLike(
        commentId,
        userId,
      );
      const result = {
        id: commentById.id,
        content: commentById.content,
        userId: commentById.userId,
        userLogin: commentById.userLogin,
        addedAt: commentById.addedAt,
        likesInfo: likesInformation,
      };

      return result;
    }
  }
  @UseGuards(Auth)
  //@UseGuards(UserFind)
  @Delete(':id')
  @HttpCode(204)
  async deleteComment(@Param('id') id: string, @Req() req: RequestWithUser) {
    const commentById = await this.commentsService.getComment(id);
    if (!commentById) {
      throw new NotFoundException('Comment Not Found');
    }
    const userId = req.user?.id || '1';
    ///const useriD = req.user?.id || "1";
    if (commentById.userId !== userId) {
      throw new ForbiddenException();
    }
    const isdelete = await this.commentsService.deleteComment(id);
    if (isdelete) {
      return;
    }
  }
  @UseGuards(Auth)
  @Put(':commentId/like-status')
  @HttpCode(204)
  async updateLikeComments(
    @Param('commentId') commentId: string,
    @Body() body: like,
    @Req() req: RequestWithUser,
  ) {
    const commentById = await this.commentsService.getComment(commentId);
    if (!commentById) {
      throw new NotFoundException();
    }
    const userId = req.user?.id || '1';
    const result = await this.commentsService.updateLikeComments(
      commentId,
      userId,
      body.likeStatus,
    );
    return;
  }
}
