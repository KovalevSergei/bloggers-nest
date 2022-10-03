import { Injectable } from '@nestjs/common';
import { BloggersRepository } from '../bloggersSQL.repository';

@Injectable()
export class UpdateBloggersUseCase {
  constructor(protected bloggersRepository: BloggersRepository) {}

  async execute(
    id: string,
    name: string,
    youtubeUrl: string,
  ): Promise<boolean> {
    return await this.bloggersRepository.updateBloggers(id, name, youtubeUrl);
  }
}
