import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { IsArray, IsIn } from 'class-validator';
import { NotFoundError } from 'rxjs';
import { CommentsService } from './comments-service';
let status2 = ['None', 'Like', 'Dislike'];
class like {
  @IsIn(status2)
  status: string;
}
@Controller('comments')
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}
  @Put(':commentId')
  @HttpCode(204)
  async updateContent(
    @Param('commentId') commentId: string,
    @Body('content') content: string,
  ) {
    ///const useriD = req.user?.id || "1";
    const contentnew = await this.commentsService.updateContent(
      content,
      commentId,
      // useriD
    );
    return;
  }
  @Get(':commentId')
  async getCommentById(@Param('commentId') commentId: string) {
    const commentById = await this.commentsService.getComment(commentId);
    //const userId = req.user?.id || "1";

    if (!commentById) {
      throw new NotFoundException();
    } else {
      /* const likesInformation = await this.commentsServis.getLike(
        req.params.commentId,
        userId
      );
      const result = {
        id: commentById.id,
        content: commentById.content,
        userId: commentById.userId,
        userLogin: commentById.userLogin,
        addedAt: commentById.addedAt,
        likesInfo: likesInformation,
      }; */
      //res.status(200).json(result);
      return commentById;
    }
  }
  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    const isdelete = await this.commentsService.deleteComment(id);
    return;
  }
  @Put('/:commentId/like-status')
  @HttpCode(204)
  async updateLikeComments(
    @Param('commentId') commentId: string,
    @Body() body: like,
  ) {
    const commentById = await this.commentsService.getComment(commentId);
    if (!commentById) {
      throw new NotFoundException();
    }
    //const userId = req.user?.id || '1';
    const userId = '12';
    const result = await this.commentsService.updateLikeComments(
      commentId,
      userId,
      body.status,
    );
    return;
  }
}
