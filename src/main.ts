import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
type bloggersType = { id: string; name: string; youtubeUrl: string };

const bloggersSchema = new mongoose.Schema<bloggersType>({
  id: String,
  name: String,
  youtubeUrl: String,
});
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost/nest'),
  },
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);
}
bootstrap();

export const BloggersModel = [
  {
    provide: 'bloggersModel',
    useFactory: (connection: Connection) =>
      connection.model('bloggersModel', bloggersSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
