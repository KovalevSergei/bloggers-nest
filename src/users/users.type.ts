import { ObjectId, WithId } from 'mongodb';
export class UsersDBType {
  constructor(
    public id: string,
    public accountData: {
      login: string;
      email: string;
      passwordHash: string;
      passwordSalt: string;
      createdAt: Date;
    },
    public emailConfirmation: {
      confirmationCode: string;
      expirationDate: Date;
      isConfirmed: boolean;
    },
  ) {}
}
export type usersGetDBType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: { id: string; login: string }[];
};
export type UsersDBTypeWithId = WithId<{
  id: string;
  accountData: {
    login: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    createdAt: Date;
  };
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
}>;
