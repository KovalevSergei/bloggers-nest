import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersDBTypeWithId } from 'src/users/users.type';
import { CommentsRepository } from 'src/comments/comments-repositorySQL';
type RequestWithUser = Request & { user: UsersDBTypeWithId };
@Injectable()
export class UserFind implements CanActivate {
  constructor(protected commentRepository: CommentsRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();
    const userId = req.user?.id;
    const id = req.params.commentId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const comment = await this.commentRepository.getComment(id);
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
