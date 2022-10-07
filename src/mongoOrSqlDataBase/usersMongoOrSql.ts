import { UsersRepositoryQuery } from '../users/users-repositoryMongoQuery';
import { UsersRepositoryNativeQuery } from '../users/users-repositoryNativeQuery';
import { UsersRepository } from '../users/users-repositorySQL';
import { UsersRepositorySql } from '../users/users-repositorySQL2';
import { UsersRepositoryNative } from '../users/users-repositorySQLNative';
import { UsersRepositorySqlQuery } from '../users/users-repositorySqlQuery';

export const UsersMongoOrSql = (env: string) => {
  console.log(env, 'ENVdataBase');
  switch (env) {
    case 'mongo': {
      return UsersRepository;
    }
    case 'sql': {
      return UsersRepositorySql;
    }
    default: {
      return UsersRepositoryNative;
    }
  }
};

export const UsersMongoOrSqlQuery = (env: string) => {
  console.log(env, 'ENVdataBase');
  switch (env) {
    case 'mongo': {
      return UsersRepositoryQuery;
    }
    case 'sql': {
      return UsersRepositorySqlQuery;
    }
    default: {
      return UsersRepositoryNativeQuery;
    }
  }
};
