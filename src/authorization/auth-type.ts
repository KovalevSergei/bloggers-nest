import { ObjectId, WithId } from 'mongodb';

export type refreshToken = WithId<{ token: string }>;
export class RefreshToken {
  constructor(public token: string) {}
}
