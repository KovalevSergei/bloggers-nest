import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/posts.repositorySQL';
import { BloggersRepository } from '../bloggersSQL.repository';
import { bloggersType } from '../bloggers.type';

@Injectable()
export class CreateBloggersUseCase {
  constructor(
    protected bloggersRepository: BloggersRepository,
    protected postsRepository: PostsRepository, //protected postsService: PostsService,
  ) {}

  async execute(name: string, youtubeUrl: string): Promise<bloggersType> {
    const bloggersnew = {
      id: Number(new Date()).toString(),
      name: name,
      youtubeUrl: youtubeUrl,
    };

    const result = this.bloggersRepository.createBloggers(bloggersnew);

    return result;
  }
}
