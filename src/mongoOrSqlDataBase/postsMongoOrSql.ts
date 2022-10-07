import { PostsRepositoryQuery } from '../posts/posts.repositoryMongoQuery';
import { PostsRepositoryNativeQuery } from '../posts/posts.repositoryNativeQuery';
import { PostsRepository } from '../posts/posts.repositorySQL';
import { PostsRepositorySql } from '../posts/posts.repositorySQL2';
import { PostsRepositoryNative } from '../posts/posts.repositorySQLNative';
import { PostsRepositorySqlQuery } from '../posts/posts.repositorySqlQuery';

export const PostsMongoOrSql = (env: string) => {
  console.log(env, 'ENVdataBase');
  switch (env) {
    case 'mongo': {
      return PostsRepository;
    }
    case 'sql': {
      return PostsRepositorySql;
    }
    default: {
      return PostsRepositoryNative;
    }
  }
};

export const PostsMongoOrSqlQuery = (env: string) => {
  console.log(env, 'ENVdataBase');
  switch (env) {
    case 'mongo': {
      return PostsRepositoryQuery;
    }
    case 'sql': {
      return PostsRepositorySqlQuery;
    }
    default: {
      return PostsRepositoryNativeQuery;
    }
  }
};
