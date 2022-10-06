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
import { CommandBus } from '@nestjs/cqrs';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsIn, IsNotEmpty, Length } from 'class-validator';
import { Auth } from '../guards/Auth';
import { UserId } from '../guards/userId';
import { UsersDBTypeWithId } from '../users/users.type';
import { CommentsRepositoryQuery } from './comments-repositoryMongoQuery';
import { CommentsService } from './comments-service';
import { DeleteCommentCommand } from './use-case/deleteCommentCommand';
import { UpdateCommentCommand } from './use-case/updateCommentCommand';
import { UpdateLikeCommentsCommand } from './use-case/updateLikeCommentsCommand';
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
  constructor(
    protected commentsService: CommentsService,
    protected commandBus: CommandBus,
    protected commentsRepositoryQuery: CommentsRepositoryQuery,
  ) {}
  @UseGuards(Auth)
  @UseGuards(UserId)
  @Put(':commentId')
  @HttpCode(204)
  async updateContent(
    @Param('commentId') commentId: string,
    @Body() body: CommetnsUpdate,
    @Req() req: RequestWithUser,
  ) {
    const commentById = await this.commentsRepositoryQuery.getComment(
      commentId,
    );
    const userId = req.user?.id || '1';
    ///const useriD = req.user?.id || "1";
    if (commentById.userId !== userId) {
      throw new ForbiddenException();
    }

    const contentnew = await this.commandBus.execute(
      new UpdateCommentCommand(body.content, commentId),
      // useriD)
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
    const commentById = await this.commentsRepositoryQuery.getComment(
      commentId,
    );
    const userId = req.user?.id || '1';

    if (!commentById) {
      throw new NotFoundException();
    } else {
      const likesInformation = await this.commentsRepositoryQuery.getLikeStatus(
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
    const commentById = await this.commentsRepositoryQuery.getComment(id);
    if (!commentById) {
      throw new NotFoundException('Comment Not Found');
    }
    const userId = req.user?.id || '1';
    ///const useriD = req.user?.id || "1";
    if (commentById.userId !== userId) {
      throw new ForbiddenException();
    }
    const isdelete = await this.commandBus.execute(
      new DeleteCommentCommand(id),
    );
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
    const commentById = await this.commentsRepositoryQuery.getComment(
      commentId,
    );
    if (!commentById) {
      throw new NotFoundException();
    }
    const userId = req.user?.id || '1';
    const result = await this.commandBus.execute(
      new UpdateLikeCommentsCommand(commentId, userId, body.likeStatus),
    );
    return;
  }
}
