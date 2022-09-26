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
import { bloggerStub } from './Stub/bloggers.stub';
import { response } from 'express';
import { UsingJoinColumnIsNotAllowedError } from 'typeorm';

jest.setTimeout(5000);

describe('BloggersController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: INestApplication;

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

  afterEach(async () => {
    await dbConnection.collection('bloggers').deleteMany({});
    // const collections = dbConnection.collections;

    // for (const key in collections) {
    //   const collection = collections[key];
    //   await collection.deleteMany({});
    // }
  });

  afterAll(async () => {
    await app.close();
    await httpServer.close();
  });

  it('should return all bloggers with getBloggersPagination /GET', async () => {
    await dbConnection
      .collection('bloggers')
      .insertMany([
        bloggerStub('12', 'Vasya', 'https://aaaaaaaaaaaaaaaaaa'),
        bloggerStub('13', 'VasyaV', 'https://bbbbbbbbbbbbbb'),
        bloggerStub('134', 'Vas', 'https://cccccccccccccccccc'),
        bloggerStub('34', 'Vasy', 'https://ddddddddddddddddd'),
      ]);

    const response = await request(httpServer).get(
      '/bloggers?pageNUmber=1&pageSize=2',
    );

    expect(response.body.items.length).toBe(2);
  });

  it('should create new blogger /POST', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      })
      .expect(201);

    expect(createdBlogger.body.name).toBe('Vasya');
    expect(createdBlogger.body.id).toBeDefined();
    expect(createdBlogger.body.youtubeUrl).toBe(
      'https://aaaaaaaaaaaaaaaaaa.ru',
    );
  });
  it('should create new blogger NO VALIDNye name /POST', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasyaevjeivjvjoiejovijevj',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      })
      .expect(400);
    expect(createdBlogger.body.message).toStrictEqual([
      {
        message: 'name must be shorter than or equal to 15 characters',
        field: 'name',
      },
    ]);
  });
  it('should create new blogger NO VALIDNye url /POST', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'aaaaaaaaaaaaaaaaaa',
      })
      .expect(400);

    expect(createdBlogger.body.message).toStrictEqual([
      {
        message: 'Company Url is not valid.',
        field: 'youtubeUrl',
      },
    ]);
  });
  it('blogger by id/get', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const returnBlogger = await request(httpServer)
      .get('/bloggers/' + createdBlogger.body.id)
      .expect(200);
    expect(returnBlogger.body.name).toBe(createdBlogger.body.name);
    expect(returnBlogger.body.youtubeUrl).toBe(createdBlogger.body.youtubeUrl);
  });

  it('blogger by id/get NOT FOUND', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const returnBlogger = await request(httpServer)
      .get('/bloggers/' + '13')
      .expect(404);

    expect(returnBlogger.body).toBe('Not Found');
  });

  it('blogger by put NOT FOUND', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const returnBlogger = await request(httpServer)
      .put('/bloggers/' + '13')
      .auth('admin', 'qwerty')
      .expect(400);
  });

  it('blogger by put ', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const returnBlogger = await request(httpServer)
      .put('/bloggers/' + createdBlogger.body.id)
      .auth('admin', 'qwerty')
      .send({
        name: 'Pety',
        youtubeUrl: 'https://aaaabbbbaaaaa.ru',
      })
      .expect(204);
    const returnBlogger2 = await request(httpServer)
      .get('/bloggers/' + createdBlogger.body.id)
      .auth('admin', 'qwerty')
      .expect(200);
    expect(returnBlogger2.body.name).toBe('Pety');
    expect(returnBlogger2.body.youtubeUrl).toBe('https://aaaabbbbaaaaa.ru');
  });

  it('blogger by put Name ne Validnoe', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasyadasb vsdkbdsb vnd d  dd d ',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    expect(createdBlogger.body.message).toStrictEqual([
      {
        message: 'name must be shorter than or equal to 15 characters',
        field: 'name',
      },
    ]);
  });

  it('blogger by id/delete NOT FOUND', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const returnBlogger = await request(httpServer)
      .delete('/bloggers/' + '13')
      .auth('admin', 'qwerty')
      .expect(404);

    expect(returnBlogger.body).toBe('Not Found');
  });
  it('blogger by id/delete NOT FOUND', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const returnBlogger = await request(httpServer)
      .delete('/bloggers/' + createdBlogger.body.id)
      .auth('admin', 'qwerty')
      .expect(204);
  });
});
