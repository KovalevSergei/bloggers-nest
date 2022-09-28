import { Test } from '@nestjs/testing';
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

jest.setTimeout(5000);

describe('BloggersController', () => {
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
    // await dbConnection.collection('bloggers').deleteMany({});
    // await dbConnection.collection('posts').deleteMany({});
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
  it('blogger by id /POSt posts', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const postBlogger = await request(httpServer)
      .post('/bloggers/' + createdBlogger.body.id + '/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
      })
      .expect(201);
    expect(postBlogger.body.content).toBe('egnjkewg');
    expect(postBlogger.body.bloggerId).toBe(createdBlogger.body.id);
  });
  it('blogger by id /POSt posts not Valid title', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const postBlogger = await request(httpServer)
      .post('/bloggers/' + createdBlogger.body.id + '/posts')
      .auth('admin', 'qwerty')
      .send({
        title:
          'ergerwgerwgdkvfdklfvkvdvdfvdfvjdshfbvdshbdfshbkjdhfbkjdfhbkjdfhbkjdfhbdfkjhbkjdhf',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
      })
      .expect(400);
  });
  it('blogger by id /POSt posts Unautarazition', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const postBlogger = await request(httpServer)
      .post('/bloggers/' + createdBlogger.body.id + '/posts')
      .send({
        title: 'ergerwgerwgdkvfdklfvk',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
      })
      .expect(401);
  });
  it('blogger by id /POSt posts not Valid shortDescrirpion', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const postBlogger = await request(httpServer)
      .post('/bloggers/' + createdBlogger.body.id + '/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwgdkvfdklfvkvdvdfvdfv',
        shortDescription:
          'svggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribv',
        content: 'egnjkewg',
      })
      .expect(400);
  });
  it('blogger by id /POSt posts not Valid content', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const postBlogger = await request(httpServer)
      .post('/bloggers/' + createdBlogger.body.id + '/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwgdkvfdklfvkvdvdfvdfv',
        shortDescription:
          'svggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdh',
        content:
          'egnjkewgsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdhsfbvjdhfbvjdhfbvhjdfbvhjdfbvdfsbkjdeshgkjdhfsvkjndfvkjnruibvuibdvbriuvbrivbribvribv',
      })
      .expect(400);
    expect(postBlogger.body.message).toStrictEqual([
      {
        field: 'content',
        message: 'content must be shorter than or equal to 1000 characters',
      },
    ]);
  });
  it('blogger by id /POSt posts not Valid content', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const postBlogger = await request(httpServer)
      .post('/bloggers/' + 12 + '/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwgdkvfdklfvkvdvdfvdfv',
        shortDescription:
          'svggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdfbvhjdfbvhjdfbvjdh',
        content:
          'svkjndfvkjnruibvuibdvbriuvbrivbribvribvvggssdgdgsvdbvvkjndfvkjnruibvuibdvbriuvbrivbribvribvsvggssdgdgsvdbvfdfkjsbvfdsbvdmnbvdmnsfbvdsfbvdhfkbvdf',
      })
      .expect(404);
  });
  it('blogger by get posts ', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const postBlogger = await request(httpServer)
      .post('/bloggers/' + createdBlogger.body.id + '/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
      })
      .expect(201);
    const postBloggerget = await request(httpServer)
      .get('/bloggers/' + createdBlogger.body.id + '/posts')
      .expect(200);
    expect(postBloggerget.body.totalCount).toBe(1);
  });
  it('blogger by get posts 404 not exist ', async () => {
    const createdBlogger = await request(httpServer)
      .post('/bloggers')
      .auth('admin', 'qwerty')
      .send({
        name: 'Vasya',
        youtubeUrl: 'https://aaaaaaaaaaaaaaaaaa.ru',
      });
    const postBlogger = await request(httpServer)
      .post('/bloggers/' + createdBlogger.body.id + '/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'ergerwgerwg',
        shortDescription: 'svggssdgdgs',
        content: 'egnjkewg',
      })
      .expect(201);
    const postBloggerget = await request(httpServer)
      .get('/bloggers/' + 12 + '/posts')
      .expect(404);
    expect(postBloggerget.body).toBe('If specific blogger is not exists');
  });
});
