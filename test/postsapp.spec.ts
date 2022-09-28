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
import { Bloggers } from 'src/db.sql';

jest.setTimeout(5000);

describe('PostsController', () => {
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
    blogger = await createBlogger();
  });

  afterEach(async () => {
    /*  await dbConnection.collection('bloggers').deleteMany({});
    await dbConnection.collection('posts').deleteMany({});
    await dbConnection.collection('comments').deleteMany({});
    await dbConnection.collection('users').deleteMany({}); */
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
  it('create POST', async () => {
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
    expect(createdPost.body.title).toBe('ergerwgerwg');
    expect(createdPost.body.content).toBe('egnjkewg');
    expect(createdPost.body.shortDescription).toBe('svggssdgdgs');
  });
  it('create POST errros Unauthorized', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      })
      .expect(201);
    const createdPost = await request(httpServer)
      .post('/posts')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: createdBlogger.body.id,
      })
      .expect(401);
  });
  it('create POST ne Validnoe title', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title:
          'ergerwgerwgevewvevertveververvrevrevgreyvgeryuvgeryvgerhvregvhjerwvghjerwgvrhjevghjergvhjeg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(400);
    expect(createdPost.body.message).toStrictEqual([
      {
        field: 'title',
        message: 'title must be shorter than or equal to 30 characters',
      },
    ]);
  });
  it('create POST ne Validnoe shortDescription', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwgevewvevertveve',
        shortDescription:
          'svggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfj',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(400);

    expect(createdPost.body.message).toStrictEqual([
      {
        field: 'shortDescription',
        message:
          'shortDescription must be shorter than or equal to 100 characters',
      },
    ]);
  });
  it('create POST ne Validnoe content', async () => {
    const createdPost = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwgevewvevertveve',
        shortDescription:
          'svggssdnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfj',
        content:
          'egnjkewgsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfj',
        bloggerId: blogger._body.id,
      })
      .expect(400);
    expect(createdPost.body.message).toStrictEqual([
      {
        field: 'content',
        message: 'content must be shorter than or equal to 1000 characters',
      },
    ]);
  });
  it('put POST ne Validnoe content', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdPost = await request(httpServer)
      .put('/posts/' + createdPost1.body.id)
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwgevewvevertveve',
        shortDescription:
          'svggssdnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfj',
        content:
          'egnjkewgsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfj',
        bloggerId: blogger._body.id,
      })
      .expect(400);
    expect(createdPost.body.message).toStrictEqual([
      {
        field: 'content',
        message: 'content must be shorter than or equal to 1000 characters',
      },
    ]);
  });
  it('put POST ne Validnoe shortDescription', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdPost = await request(httpServer)
      .put('/posts/' + createdPost1.body.id)
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwgevewvevertveve',
        shortDescription:
          'svggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfjsvggssdgdgsdsjvhd;ljvhdkjshfvdkjshvfkjdsvkjrnevkjbrnwkjvbnkjfvbndksfj',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(400);

    expect(createdPost.body.message).toStrictEqual([
      {
        field: 'shortDescription',
        message:
          'shortDescription must be shorter than or equal to 100 characters',
      },
    ]);
  });
  it('put POST ne Validnoe title', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdPost = await request(httpServer)
      .put('/posts/' + createdPost1.body.id)
      .auth('admin', 'qwerty')
      .send({
        title:
          'ergerwgerwgevewvevertveververvrevrevgreyvgeryuvgeryvgerhvregvhjerwvghjerwgvrhjevghjergvhjeg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(400);
    expect(createdPost.body.message).toStrictEqual([
      {
        field: 'title',
        message: 'title must be shorter than or equal to 30 characters',
      },
    ]);
  });
  it('put POSTs all good', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdPost = await request(httpServer)
      .put('/posts/' + createdPost1.body.id)
      .auth('admin', 'qwerty')
      .send({
        title: 'ASSSSSSS',
        shortDescription: 'svggssdgdgsdvvdffvdfvdf',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(204);
  });
  it('put POST ne Validnoe title', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdPost = await request(httpServer)
      .put('/posts/' + createdPost1.body.id)
      .auth('admin', 'qwerty')
      .send({
        title:
          'ergerwgerwgevewvevertveververvrevrevgreyvgeryuvgeryvgerhvregvhjerwvghjerwgvrhjevghjergvhjeg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(400);
    expect(createdPost.body.message).toStrictEqual([
      {
        field: 'title',
        message: 'title must be shorter than or equal to 30 characters',
      },
    ]);
  });
  it('put POSTs unauthorized', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdPost = await request(httpServer)
      .put('/posts/' + createdPost1.body.id)
      .send({
        title: 'ASSSSSSS',
        shortDescription: 'svggssdgdgsdvvdffvdfvdf',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(401);
  });
  it('delete POSTs unauthorized', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdPost = await request(httpServer)
      .delete('/posts/' + createdPost1.body.id)
      .expect(401);
  });
  it('delete POSTs not found', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdPost = await request(httpServer)
      .delete('/posts/' + 12)
      .auth('admin', 'qwerty')
      .expect(404);
    expect(createdPost.body).toStrictEqual('Not Found');
  });
  it('delete POSTs not found', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdPost = await request(httpServer)
      .delete('/posts/' + createdPost1.body.id)
      .auth('admin', 'qwerty')
      .expect(204);
  });
  it('get POSTs not found', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const getPost = await request(httpServer)
      .get('/posts/' + 12)
      .auth('admin', 'qwerty')
      .expect(404);
    expect(getPost.body).toBe('Not Found');
  });
  it('get POSTs for id', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const getPost = await request(httpServer)
      .get('/posts/' + createdPost1.body.id)
      .auth('admin', 'qwerty')
      .expect(200);
    expect(getPost.body.content).toBe('egnjkewg');
    expect(getPost).toBeTruthy();
    expect(getPost.body.bloggerName).toBe(blogger._body.name);
  });
  it('get POSTs', async () => {
    const createdPost1 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const createdPost2 = await request(httpServer)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg!',
        shortDescription: 'svggssdgdgs2',
        content: 'egnjkewg22',
        bloggerId: blogger._body.id,
      })
      .expect(201);
    const getPost = await request(httpServer)
      .get('/posts')
      .auth('admin', 'qwerty')
      .expect(200);
    expect(getPost.body.totalCount).toBe(2);
    expect(getPost.body.pageSize).toBe(10);
  });

  it('post / POST comments all good', async () => {
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
  });

  it('post comments Unautarazition', async () => {
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

    const comment = await request(httpServer)
      .post('/posts/' + createdPost.body.id + '/comments')
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(401);
  });

  it('post comments 404', async () => {
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
      .post('/posts/' + 12 + '/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'savhbdhfsbvdhfjsbvhjdfbv' })
      .expect(404);
  });

  it('post / POST comments valid content', async () => {
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
      .send({ content: '' })
      .expect(400);
  });

  it('post / GET comments valid content', async () => {
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
      .send({ content: 'dbfb' });
    const commentGet = await request(httpServer)
      .get('/posts/' + createdPost.body.id + '/comments')
      .expect(200);
  });

  it('post / GET comments valid content', async () => {
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
      .send({ content: 'dbfb' });
    const commentGet = await request(httpServer)
      .get('/posts/' + 12 + '/comments')
      .expect(404);
  });
});
