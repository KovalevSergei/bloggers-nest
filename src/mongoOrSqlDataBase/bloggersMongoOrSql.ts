import { BloggersRepositoryNativeQuery } from '../bloggers/bloggers.repositoryNativeQuery';
import { BloggersRepositoryQuery } from '../bloggers/bloggers.repositoryQueryMongo';
import { BloggersRepositorySqlQuery } from '../bloggers/bloggers.repositorySqlQuery';
import { BloggersRepository } from '../bloggers/bloggersSQL.repository';
import { BloggersRepositorySql } from '../bloggers/bloggersSQL.repository2';
import { BloggersRepositoryNative } from '../bloggers/bloggersSQL.repositoryNative';

const BloggersMongoOrSql = (env: string) => {
  console.log(env, 'ENVdataBase');
  switch (env) {
    case 'mongo': {
      const a = [BloggersRepository, BloggersRepositoryQuery];
      return a;
    }
    case 'sql': {
      const a = [BloggersRepositorySql, BloggersRepositorySqlQuery];
    }
    default: {
      const a = [BloggersRepositoryNative, BloggersRepositoryNativeQuery];
    }
  }
};
