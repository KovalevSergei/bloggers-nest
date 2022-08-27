import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
import { RefreshToken, refreshToken } from './authorization/auth-type';
import { bloggersType } from './bloggers/bloggers.type';
import { commentsDBType, likeCommentsWithId } from './comments/comments.type';
import { likePostWithId, postsType } from './posts/posts.type';
import { UsersDBType } from './users/users.type';

export const bloggersSchema = new mongoose.Schema<bloggersType>({
  id: String,
  name: String,
  youtubeUrl: String,
});

export const postsSchema = new mongoose.Schema<postsType>({
  id: String,
  title: String,
  shortDescription: String,
  content: String,
  bloggerId: String,
  bloggerName: String,
  addedAt: Date,
});
export const usersSchema = new mongoose.Schema<UsersDBType>({
  id: String,
  accountData: {
    login: String,
    email: String,
    passwordHash: String,
    passwordSalt: String,
    createdAt: Date,
  },
  emailConfirmation: {
    confirmationCode: String,
    expirationDate: Date,
    isConfirmed: Boolean,
  },
});
export const likeCommentsShema = new mongoose.Schema<likeCommentsWithId>({
  commentsId: String,
  userId: String,
  login: String,
  myStatus: String,
  addedAt: Date,
});

export const commentsSchema = new mongoose.Schema<commentsDBType>({
  id: String,
  postId: String,
  content: String,
  userId: String,
  userLogin: String,
  addedAt: String,
});
export const likePostsShema = new mongoose.Schema<likePostWithId>({
  postsId: String,
  userId: String,
  login: String,
  myStatus: String,
  addedAt: Date,
});
export const tokenSchema = new mongoose.Schema<RefreshToken>({
  token: String,
});
export const ipSchema = new mongoose.Schema({
  point: String,
  ip: String,
  data: Date,
});
export type ipType = {
  point: string;
  ip: string;
  data: Date;
};

export const IP_MODEL = 'ip';
export const TOKEN_COLLECTION = 'token';
export const LIKE_POSTS_COLLECTION = 'likePost';
export const USERS_COLLECTION = 'users';
export const BLOGGERS_COLLECTION = 'bloggers';
export const POSTS_COLLECTION = 'posts';
export const COMMENTS_COLLECTION = 'comments';
export const LIKE_COMMENTS_COLLECTION = 'likeComments';

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
