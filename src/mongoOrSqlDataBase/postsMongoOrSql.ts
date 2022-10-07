import { PostsRepositoryQuery } from '../posts/posts.repositoryMongoQuery';
import { PostsRepositoryNativeQuery } from '../posts/posts.repositoryNativeQuery';
import { PostsRepository } from '../posts/posts.repositorySQL';
import { PostsRepositorySql } from '../posts/posts.repositorySQL2';
import { PostsRepositoryNative } from '../posts/posts.repositorySQLNative';
import { PostsRepositorySqlQuery } from '../posts/posts.repositorySqlQuery';

const PostsMongoOrSql = (env: string) => {
  console.log(env, 'ENVdataBase');
  switch (env) {
    case 'mongo': {
      const a = [PostsRepository, PostsRepositoryQuery];
      return a;
    }
    case 'sql': {
      const a = [PostsRepositorySql, PostsRepositorySqlQuery];
    }
    default: {
      const a = [PostsRepositoryNative, PostsRepositoryNativeQuery];
    }
  }
};
