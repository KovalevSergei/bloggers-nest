import { ObjectId, WithId } from 'mongodb';

export type refreshToken = WithId<{ token: string }>;
