import { Module } from '@nestjs/common';
import { databaseProviders } from './db';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
