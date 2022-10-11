import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersDBTypeWithId } from '../users/users.type';
import { IRepositoryCommentsQuery } from '../comments/use-case/commentsRepository.interface';
type RequestWithUser = Request & { user: UsersDBTypeWithId };
@Injectable()
export class UserFind implements CanActivate {
  constructor(
    @Inject('CommentsRepositoryQuery')
    protected commentRepositoryQuery: IRepositoryCommentsQuery,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();
    const userId = req.user?.id;
    const id = req.params.commentId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const comment = await this.commentRepositoryQuery.getComment(id);
    if (!comment) {
      throw new NotFoundException();
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException();
    } else {
      return true;
    }
  }
}
