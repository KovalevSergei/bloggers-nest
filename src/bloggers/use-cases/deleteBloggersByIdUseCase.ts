import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/posts.repositorySQL';
import { BloggersRepository } from '../bloggersSQL.repository';
import { postsType } from 'src/posts/posts.type';

@Injectable()
export class DeleteBloggersByIdUseCase {
  constructor(protected bloggersRepository: BloggersRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.bloggersRepository.deleteBloggersById(id);
  }
}
