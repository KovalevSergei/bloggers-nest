import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersDBTypeWithId } from '../users/users.type';

type RequestWithUser = Request & { user: UsersDBTypeWithId };
import { ObjectId } from 'mongodb';
import { ipType, IP_MODEL } from '../db';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class Mistake429 implements CanActivate {
  constructor(
    @InjectModel(IP_MODEL)
    private ipModel: Model<ipType>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();
    const point = req.method + req.originalUrl;

    const ip = req.ip;

    const newCRUD = {
      point: point,
      ip: ip,
      data: new Date(),
    };

    await this.ipModel.insertMany({ ...newCRUD, _id: new ObjectId() });
    const fromData = new Date();
    fromData.setSeconds(fromData.getSeconds() - 10);
    const totalCount = await this.ipModel.count({
      point: point,
      ip: ip,
      data: { $gt: fromData },
    });

    if (totalCount > 5) {
      throw new HttpException('429', 429);
    } else {
      return true;
    }
    /* const userId = req.user?.id;
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
    } */
  }
}
