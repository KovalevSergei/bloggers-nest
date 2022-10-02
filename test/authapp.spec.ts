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

jest.setTimeout(5000);

describe('AuthController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: INestApplication;
  let blogger;
  beforeEach(async () => {
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
    blogger = await createBlogger();
  });
  //   beforeEach(async () => {
  //     /*     await dbConnection.collection('comments').deleteMany({});
  //     await dbConnection.collection('users').deleteMany({});
  //     // await dbConnection.collection('bloggers').deleteMany({});
  //     await dbConnection.collection('posts').deleteMany({}); */
  //     blogger = await createBlogger();
  //   });

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

  afterEach(async () => {
    // await dbConnection.collection('users').deleteMany({});
    const collections = dbConnection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }

    await app.close();
    // Close the server instance after each test
    httpServer.close();
  });

  afterAll((done) => {
    app.close();
    httpServer.close();
    dbConnection.close();
    done();
  });

  it(' / get me 401 Unauthorized', async () => {
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

    const token = logininzationUserAndCreatedTokens.body.accessToken;
    const me = await request(httpServer).get('/auth/me').expect(401);
  });

  it(' / get me 200', async () => {
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
    const me = await request(httpServer)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(me.body.email).toBe('cre@qwe.ru');
    expect(me.body.login).toBe('Vasya');
    expect(me.body.userId).toBeTruthy();
  });

  it(' / post logout 204', async () => {
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

    const cookie = logininzationUserAndCreatedTokens.get('Set-Cookie');

    const logout = await request(httpServer)
      .post('/auth/logout')
      .set('Cookie', cookie)
      .expect(204);
  });

  it(' / post logout 401', async () => {
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

    const cookie = logininzationUserAndCreatedTokens.get('Set-Cookie');

    const logout = await request(httpServer)
      .post('/auth/logout')
      .set('Cookie', '1')
      .expect(401);
  });

  it(' / post refresh-token 401', async () => {
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

    const cookie = logininzationUserAndCreatedTokens.get('Set-Cookie');

    const logout = await request(httpServer)
      .post('/auth/refresh-token')
      .set('Cookie', '1')
      .expect(401);
  });

  it(' / post refresh-token 200', async () => {
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

    const cookie = logininzationUserAndCreatedTokens.get('Set-Cookie');

    const accessToken = await request(httpServer)
      .post('/auth/refresh-token')
      .set('Cookie', cookie)
      .expect(200);
    expect(accessToken.body.accessToken).toBeTruthy();
  });

  it(' / post login 200', async () => {
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
      .send({ login: 'Vasya', password: '21457346578' })
      .expect(200);
    expect(logininzationUserAndCreatedTokens.body.accessToken).toBeTruthy();
    const cookie = logininzationUserAndCreatedTokens.get('Set-Cookie');
    expect(cookie).toBeTruthy();
  });

  it(' / post login 400 Validnoe login', async () => {
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
      .send({ login: 'Va', password: '21457346578' })
      .expect(400);
    expect(logininzationUserAndCreatedTokens.body.message).toStrictEqual([
      {
        field: 'login',
        message: 'login must be longer than or equal to 3 characters',
      },
    ]);
  });

  it(' / post login 400 Validnoe password', async () => {
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
      .send({ login: 'Vav', password: '2145' })
      .expect(400);
    expect(logininzationUserAndCreatedTokens.body.message).toStrictEqual([
      {
        field: 'password',
        message: 'password must be longer than or equal to 6 characters',
      },
    ]);
  });

  it(' / post login 401 password or login is wrong', async () => {
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
      .send({ login: 'Vavef', password: '2145efefefr' })
      .expect(401);
  });

  it(' / post login 429', async () => {
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
      .send({ login: 'Vasya', password: '21457346578' })
      .expect(200);

    const logininzationUserAndCreatedTokens2 = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' })
      .expect(200);

    const logininzationUserAndCreatedTokens3 = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' })
      .expect(200);

    const logininzationUserAndCreatedTokens4 = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' })
      .expect(200);

    const logininzationUserAndCreatedTokens5 = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' })
      .expect(200);

    const logininzationUserAndCreatedTokens6 = await request(httpServer)
      .post('/auth/login')
      .send({ login: 'Vasya', password: '21457346578' })
      .expect(429);
  });

  it(' / post registration-email-resending 429', async () => {
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
      .post('/auth/registration-email-resending')
      .send({ email: 'cre@qwe.ru' })
      .expect(204);
    const logininzationUserAndCreatedTokens2 = await request(httpServer)
      .post('/auth/registration-email-resending')
      .send({ email: 'cre@qwe.ru' })
      .expect(204);
    const logininzationUserAndCreatedTokens3 = await request(httpServer)
      .post('/auth/registration-email-resending')
      .send({ email: 'cre@qwe.ru' })
      .expect(204);
    const logininzationUserAndCreatedTokens4 = await request(httpServer)
      .post('/auth/registration-email-resending')
      .send({ email: 'cre@qwe.ru' })
      .expect(204);
    const logininzationUserAndCreatedTokens5 = await request(httpServer)
      .post('/auth/registration-email-resending')
      .send({ email: 'cre@qwe.ru' })
      .expect(204);
    const logininzationUserAndCreatedTokens6 = await request(httpServer)
      .post('/auth/registration-email-resending')
      .send({ email: 'cre@qwe.ru' })
      .expect(429);
  });

  it(' / post registration-email-resending 400', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);

    const emailRes = await request(httpServer)
      .post('/auth/registration-email-resending')
      .send({ email: 'creqwe.ru' })
      .expect(400);
    expect(emailRes.body.message).toStrictEqual([
      { field: 'email', message: 'email must be an email' },
    ]);
  });

  it(' / post registration-email-resending 204', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);

    const emailRes = await request(httpServer)
      .post('/auth/registration-email-resending')
      .send({ email: 'cre@qwe.ru' })
      .expect(204);
  });

  it(' / post registration 204', async () => {
    const createdUsers = await request(httpServer)
      .post('/auth/registration')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(204);
  });

  it(' / post registration 400', async () => {
    const createdUsers = await request(httpServer)
      .post('/auth/registration')
      .auth('admin', 'qwerty')
      .send({
        login: 'Va',
        email: 'creqwe.ru',
        password: '214',
      })
      .expect(400);
    expect(createdUsers.body.message).toStrictEqual([
      {
        field: 'login',
        message: 'login must be longer than or equal to 3 characters',
      },
      { field: 'email', message: 'email must be an email' },
      {
        field: 'password',
        message: 'password must be longer than or equal to 6 characters',
      },
    ]);
  });

  it(' / post registration 429', async () => {
    const createdUsers = await request(httpServer)
      .post('/auth/registration')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vas',
        email: 'cr@qwe.ru',
        password: '213456',
      })
      .expect(204);
    const createdUsers2 = await request(httpServer)
      .post('/auth/registration')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vass',
        email: 'cr2@qwe.ru',
        password: '2213456',
      })
      .expect(204);
    const createdUsers3 = await request(httpServer)
      .post('/auth/registration')
      .auth('admin', 'qwerty')
      .send({
        login: 'Va1s',
        email: 'cr1@qwe.ru',
        password: '2132333456',
      })
      .expect(204);
    const createdUsers4 = await request(httpServer)
      .post('/auth/registration')
      .auth('admin', 'qwerty')
      .send({
        login: 'V23as',
        email: 'c2r@qwe.ru',
        password: '223213456',
      })
      .expect(204);
    const createdUsers5 = await request(httpServer)
      .post('/auth/registration')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vas8',
        email: 'cr@8qwe.ru',
        password: '218883456',
      })
      .expect(204);
    const createdUsers6 = await request(httpServer)
      .post('/auth/registration')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vas88',
        email: 'cr8@8qwe.ru',
        password: '2188883456',
      })
      .expect(429);
  });
});
