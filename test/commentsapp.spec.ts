import { Test, TestingModuleBuilder } from '@nestjs/testing';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/infrostructure/dataBaseService';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from '../src/exception-filter';
import { ht } from 'date-fns/locale';

jest.setTimeout(5000);

describe('CommentsController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: INestApplication;
  let blogger;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [DatabaseService],
    }).compile();
    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors) => {
          const errorsForResponse: any = [];
          errors.forEach((e) => {
            const keys = Object.keys(e.constraints || {});
            keys.forEach((ckey) => {
              errorsForResponse.push({
                message: e.constraints[ckey],
                field: e.property,
              });
            });
          });
          throw new BadRequestException(errorsForResponse);
        },
      }),
    );

    await app.init();

    // const Config = await module.resolve<ConfigService>(ConfigService);
    const DBService = await module.resolve(DatabaseService);
    dbConnection = DBService.getConnection();
    httpServer = app.getHttpServer();
  });
  beforeEach(async () => {
    /*     await dbConnection.collection('comments').deleteMany({});
    await dbConnection.collection('users').deleteMany({});
    // await dbConnection.collection('bloggers').deleteMany({});
    await dbConnection.collection('posts').deleteMany({}); */
    blogger = await createBlogger();
  });
  afterEach(async () => {
    /* await dbConnection.collection('comments').deleteMany({});
    await dbConnection.collection('users').deleteMany({});
    await dbConnection.collection('bloggers').deleteMany({});
    await dbConnection.collection('posts').deleteMany({}); */
    const collections = dbConnection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  afterAll((done) => {
    app.close();
    httpServer.close();
    dbConnection.close();
    done();
  });
  async function createBlogger() {
    const a = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    return a;
  }

  it('post / Delete comments ', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);
    const commentDelete = await request(httpServer)
      .delete('/comments/' + comment.body.id)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    /*   const commentDelete2 = await request(httpServer)
      .delete('/comments/' + comment.body.id)
      .set('Authorization', `Bearer ${token}`)
      .expect(404); */
  });

  it('post / Delete comments Unauthorized', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);
    expect(comment.body.content).toBe('savhbdhfsbvdhfjsbvhjdfbv');
    const commentDelete = await request(httpServer)
      .delete('/comments/' + comment.body.id)
      .expect(401);
  });
  it('post / Delete comments not found ', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentDelete2 = await request(httpServer)
      .delete('/comments/' + 12)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
  it('post / Get comments and not found', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentDelete2 = await request(httpServer)
      .get('/comments/' + 12)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it(' / Get comments 200', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentDelete2 = await request(httpServer)
      .get('/comments/' + comment.body.id)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(comment.body.id).toBeTruthy();
    expect(comment.body.content).toBe('savhbdhfsbvdhfjsbvhjdfbv');
    expect(comment.body.userId).toBe(createdUsers.body.id);
    expect(comment.body.userLogin).toBe('Vasya');
  });
  it(' / Put comments 204', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentPut = await request(httpServer)
      .put('/comments/' + comment.body.id)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'retopipokpvek' })
      .expect(204);
  });

  it(' / Put comments 400 not valid content', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentPut = await request(httpServer)
      .put('/comments/' + comment.body.id)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '' })
      .expect(400);
  });

  it(' / Put comments 401 Unautirazition', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentDelete2 = await request(httpServer)
      .put('/comments/' + comment.body.id)
      .send({ content: 'retopipokpvek' })
      .expect(401);
  });
  it(' / Put comments 403 Unautirazition', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const createdUsers2 = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasytta',
        email: 'crree@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const logininzationUserAndCreatedTokens2 = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasytta', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const token2 = logininzationUserAndCreatedTokens2.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentPut = await request(httpServer)
      .put('/comments/' + comment.body.id)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: 'retopipokpvek' })
      .expect(403);
  });

  it(' / Delete comments 403 Unautirazition', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const createdUsers2 = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasytta',
        email: 'crree@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const logininzationUserAndCreatedTokens2 = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasytta', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const token2 = logininzationUserAndCreatedTokens2.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentPut = await request(httpServer)
      .delete('/comments/' + comment.body.id)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403);
  });

  it(' / Put Like comments 400', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentPutLike = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .set('Authorization', `Bearer ${token}`)
      .send({ likeStatus: 'Likes' })
      .expect(400);

    expect(commentPutLike.body.message).toStrictEqual([
      {
        field: 'likeStatus',
        message:
          'likeStatus must be one of the following values: None, Like, Dislike',
      },
    ]);
  });

  it(' / Put Like comments 401', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentPutLike = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .send({ likeStatus: 'Like' })
      .expect(401);
  });

  it(' / Put Like comments 404', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentPutLike = await request(httpServer)
      .put('/comments/' + 12 + '/like-status')
      .set('Authorization', `Bearer ${token}`)
      .send({ likeStatus: 'Like' })
      .expect(404);
  });

  it(' / Put Like comments 204 Like', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentPutLike = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .set('Authorization', `Bearer ${token}`)
      .send({ likeStatus: 'Like' })
      .expect(204);
  });

  it(' / Put Like comments 204 Dislike', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentPutLike = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .set('Authorization', `Bearer ${token}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
  });

  it(' / Put Like comments 204 Dislike', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);

    const commentPutLike = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .set('Authorization', `Bearer ${token}`)
      .send({ likeStatus: 'None' })
      .expect(204);
  });

  it(' / get comments 200 like proverka my Status like', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const createdUsers2 = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasytta',
        email: 'crree@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const logininzationUserAndCreatedTokens2 = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasytta', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const token2 = logininzationUserAndCreatedTokens2.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);
    const commentPutLike = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .set('Authorization', `Bearer ${token}`)
      .send({ likeStatus: 'Like' })
      .expect(204);
    const commentPutLike2 = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .set('Authorization', `Bearer ${token2}`)
      .send({ likeStatus: 'Like' })
      .expect(204);

    const getComment = await request(httpServer)
      .get('/comments/' + comment.body.id)
      .set('Authorization', `Bearer ${token2}`);
    expect(200);

    expect(getComment.body.likesInfo.likesCount).toBe(2);
    expect(getComment.body.likesInfo.myStatus).toBe('Like');
  });

  it(' / get comments 200 like proverka my Status Dislike', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const createdUsers2 = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasytta',
        email: 'crree@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const logininzationUserAndCreatedTokens2 = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasytta', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const token2 = logininzationUserAndCreatedTokens2.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);
    const commentPutLike = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .set('Authorization', `Bearer ${token}`)
      .send({ likeStatus: 'Like' })
      .expect(204);
    const commentPutLike2 = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .set('Authorization', `Bearer ${token2}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);

    const getComment = await request(httpServer)
      .get('/comments/' + comment.body.id)
      .set('Authorization', `Bearer ${token2}`);
    expect(200);

    expect(getComment.body.likesInfo.likesCount).toBe(1);
    expect(getComment.body.likesInfo.dislikesCount).toBe(1);
    expect(getComment.body.likesInfo.myStatus).toBe('Dislike');
  });

  it(' / get comments 200 like proverka my Status Dislike', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const createdUsers2 = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasytta',
        email: 'crree@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
    const logininzationUserAndCreatedTokens = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' });
    const logininzationUserAndCreatedTokens2 = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasytta', password: '21457346578' });
    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const token2 = logininzationUserAndCreatedTokens2.body.accessToken;
    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(201);
    const commentPutLike = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .set('Authorization', `Bearer ${token}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
    const commentPutLike2 = await request(httpServer)
      .put('/comments/' + comment.body.id + '/like-status')
      .set('Authorization', `Bearer ${token2}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);

    const getComment = await request(httpServer).get(
      '/comments/' + comment.body.id,
    );
    expect(200);

    expect(getComment.body.likesInfo.likesCount).toBe(0);
    expect(getComment.body.likesInfo.dislikesCount).toBe(2);
    expect(getComment.body.likesInfo.myStatus).toBe('None');
  });
});
