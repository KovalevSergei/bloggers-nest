import { Controller, Delete, HttpCode } from '@nestjs/common';
import { TestingService } from './test-service';

@Controller('testing')
export class TestingController {
  constructor(protected testingService: TestingService) {}
  @Delete('all-data')
  @HttpCode(204)
  async DeleteAll() {
    await this.testingService.deleteCollection();
    return;
  }
}
