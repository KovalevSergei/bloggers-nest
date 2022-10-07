import { CommentsRepositoryQuery } from '../comments/comments-repositoryMongoQuery';
import { CommentsRepositoryNativeQuery } from '../comments/comments-repositoryQueryNative';
import { CommentsRepository } from '../comments/comments-repositorySQL';
import { CommentsRepositorySql } from '../comments/comments-repositorySQL2';
import { CommentsRepositoryNative } from '../comments/comments-repositorySQLNative';
import { CommentsRepositorySqlQuery } from '../comments/comments-repositorySqlQuery';

const CommentsMongoOrSql = (env: string) => {
  console.log(env, 'ENVdataBase');
  switch (env) {
    case 'mongo': {
      const a = [CommentsRepository, CommentsRepositoryQuery];
      return a;
    }
    case 'sql': {
      const a = [CommentsRepositorySql, CommentsRepositorySqlQuery];
    }
    default: {
      const a = [CommentsRepositoryNative, CommentsRepositoryNativeQuery];
    }
  }
};
