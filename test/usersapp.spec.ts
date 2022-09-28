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

describe('UsersController', () => {
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
    // await dbConnection.collection('users').deleteMany({});
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

  it('create users /POST', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578',
      })
      .expect(201);
  });
  it('create users /POST  Unautorazition', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578326578',
      })
      .expect(401);
  });
  it('create users /POST not valid login double', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578326578',
      })
      .expect(201);
    const createdUsers2 = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre23@qwe.ru',
        password: '21457346578326578',
      })
      .expect(400);
    expect(createdUsers2.body).toStrictEqual({
      errorsMessages: [{ field: 'login', message: 'login is used' }],
    });
  });
  it('create users /POST not valid email double', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya',
        email: 'cre@qwe.ru',
        password: '21457346578326578',
      })
      .expect(201);
    const createdUsers2 = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasya2',
        email: 'cre@qwe.ru',
        password: '21457346578326578',
      })
      .expect(400);
    expect(createdUsers2.body).toStrictEqual({
      errorsMessages: [{ field: 'email', message: 'mail is used' }],
    });
  });
  it('create users /POST not valid login ', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Va',
        email: 'cre@qwe.ru',
        password: '21457346578326578',
      })
      .expect(400);
    expect(createdUsers.body.message).toStrictEqual([
      {
        field: 'login',
        message: 'login must be longer than or equal to 3 characters',
      },
    ]);
  });
  it('create users /POST not valid paswword ', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasdf',
        email: 'cre@qwe.ru',
        password: '2145',
      })
      .expect(400);
    expect(createdUsers.body.message).toStrictEqual([
      {
        field: 'password',
        message: 'password must be longer than or equal to 6 characters',
      },
    ]);
  });
  it('delete users  ', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasdf',
        email: 'cre@qwe.ru',
        password: '2145dvdvfdf',
      })
      .expect(201);
    const delUsers = await request(httpServer)
      .delete('/users/' + createdUsers.body.id)
      .auth('admin', 'qwerty')
      .expect(204);
  });
  it('delete users Unautorazitoin 401 ', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasdf',
        email: 'cre@qwe.ru',
        password: '2145dvdvfdf',
      })
      .expect(201);
    const delUsers = await request(httpServer)
      .delete('/users/' + createdUsers.body.id)
      .expect(401);
  });
  it('delete users Unautorazitoin 401 ', async () => {
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasdf',
        email: 'cre@qwe.ru',
        password: '2145dvdvfdf',
      })
      .expect(201);
    const delUsers = await request(httpServer)
      .delete('/users/' + 12)
      .auth('admin', 'qwerty')
      .expect(404);
  });
  it('get users  ', async () => {
    const users1 = await request(httpServer).get('/users').expect(200);
    expect(users1.body.totalCount).toBe(0);
    const createdUsers = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasdf',
        email: 'cre@qwe.ru',
        password: '2145dvdvfdf',
      })
      .expect(201);
    const createdUsers2 = await request(httpServer)
      .post('/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'Vasdf2',
        email: 'cr2e@qwe.ru',
        password: '2145dvdvfdf',
      })
      .expect(201);
    const users2 = await request(httpServer).get('/users').expect(200);
    expect(users2.body.totalCount).toBe(2);
  });
});
