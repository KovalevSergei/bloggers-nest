import { usersReturn } from './users-repositorySqlQuery';
import { UsersDBType, UsersDBTypeWithId, usersGetDBType } from './users.type';

export interface IRepositoryUsers {
  createUser: (newUser: UsersDBType) => Promise<UsersDBType>;
  deleteUsersId: (id: string) => Promise<boolean>;
  updateConfirmation: (id: string) => Promise<boolean>;

  updateCode: (id: string, code: string) => Promise<boolean>;
  refreshTokenSave: (token: string) => Promise<boolean>;

  refreshTokenKill: (token: string) => Promise<boolean>;
}

export interface IRepositoryUsersQuery {
  getUsers: (
    PageSize: number,
    PageNumber: number,
  ) => Promise<usersGetDBType | usersReturn>;

  userGetLogin: (login: string) => Promise<boolean>;
  FindUserLogin: (login: string) => Promise<UsersDBTypeWithId | null>;
  findUserById: (id: string) => Promise<UsersDBTypeWithId | null>;
  getUserById: (id: string) => Promise<UsersDBType | null>;

  findByConfirmationCode: (
    code: string,
  ) => Promise<UsersDBTypeWithId | null | UsersDBType>;

  findByEmail: (
    email: string,
  ) => Promise<UsersDBTypeWithId | null | UsersDBType>;

  refreshTokenFind: (token: string) => Promise<string | null>;
}
