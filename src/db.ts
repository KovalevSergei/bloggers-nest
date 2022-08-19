import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
import { bloggersType } from './bloggers/bloggers.type';

export const bloggersSchema = new mongoose.Schema<bloggersType>({
  id: String,
  name: String,
  youtubeUrl: String,
});

export const BLOGGERS_COLLECTION = 'bloggers';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost/nest'),
  },
];
export const BloggersModel = [
  {
    provide: 'bloggersModel',
    useFactory: (connection: Connection) =>
      connection.model('bloggersModel', bloggersSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
