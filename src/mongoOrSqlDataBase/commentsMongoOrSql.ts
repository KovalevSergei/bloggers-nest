import { CommentsRepositoryQuery } from '../comments/comments-repositoryMongoQuery';
import { CommentsRepositoryNativeQuery } from '../comments/comments-repositoryQueryNative';
import { CommentsRepository } from '../comments/comments-repositorySQL';
import { CommentsRepositorySql } from '../comments/comments-repositorySQL2';
import { CommentsRepositoryNative } from '../comments/comments-repositorySQLNative';
import { CommentsRepositorySqlQuery } from '../comments/comments-repositorySqlQuery';

export const CommentsMongoOrSql = (env: string) => {
  console.log(env, 'ENVdataBase');
  switch (env) {
    case 'mongo': {
      return CommentsRepository;
    }
    case 'sql': {
      return CommentsRepositorySql;
    }
    default: {
      return CommentsRepositoryNative;
    }
  }
};

export const CommentsMongoOrSqlQuery = (env: string) => {
  console.log(env, 'ENVdataBase');
  switch (env) {
    case 'mongo': {
      return CommentsRepositoryQuery;
    }
    case 'sql': {
      return CommentsRepositorySqlQuery;
    }
    default: {
      return CommentsRepositoryNativeQuery;
    }
  }
};
