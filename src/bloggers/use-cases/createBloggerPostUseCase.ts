import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/posts.repositorySQL';
import { BloggersRepository } from '../bloggersSQL.repository';
import { postsType } from 'src/posts/posts.type';

@Injectable()
export class CreateBloggersPostUseCase {
  constructor(
    protected bloggersRepository: BloggersRepository,
    protected postsRepository: PostsRepository, //protected postsService: PostsService,
  ) {}

  async execute(
    bloggerId: string,
    title: string,
    shortDescription: string,
    content: string,
  ): Promise<postsType | boolean> {
    const findName = await this.bloggersRepository.getBloggersById(bloggerId);

    if (!findName) {
      return false;
    } else {
      const postsnew = {
        id: Number(new Date()).toString(),
        title: title,
        shortDescription: shortDescription,
        content: content,
        bloggerId: bloggerId,
        bloggerName: findName.name,
        addedAt: new Date(),
      };

      const result = await this.postsRepository.createPosts(postsnew);

      return result;
    }
  }
}
