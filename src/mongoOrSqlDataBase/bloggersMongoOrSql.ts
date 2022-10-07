import { BloggersRepositoryNativeQuery } from '../bloggers/bloggers.repositoryNativeQuery';
import { BloggersRepositoryQuery } from '../bloggers/bloggers.repositoryQueryMongo';
import { BloggersRepositorySqlQuery } from '../bloggers/bloggers.repositorySqlQuery';
import { BloggersRepository } from '../bloggers/bloggersSQL.repository';
import { BloggersRepositorySql } from '../bloggers/bloggersSQL.repository2';
import { BloggersRepositoryNative } from '../bloggers/bloggersSQL.repositoryNative';

export const BloggersMongoOrSql = (env: string) => {
  switch (env) {
    case 'mongo': {
      return BloggersRepository;
    }
    case 'sql': {
      return BloggersRepositorySql;
    }
    default: {
      return BloggersRepositoryNative;
    }
  }
};

export const BloggersMongoOrSqlQuery = (env: string) => {
  switch (env) {
    case 'mongo': {
      return BloggersRepositoryQuery;
    }
    case 'sql': {
      return BloggersRepositorySqlQuery;
    }
    default: {
      return BloggersRepositoryNativeQuery;
    }
  }
};
