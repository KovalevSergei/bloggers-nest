import { Injectable } from '@nestjs/common';
import { TestingRepository } from './test-repository';

@Injectable()
export class TestingService {
  constructor(protected testingRepository: TestingRepository) {}
  async deleteCollection(): Promise<boolean> {
    return this.testingRepository.deleteAll();
  }
}
