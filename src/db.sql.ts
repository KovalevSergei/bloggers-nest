import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { postsDBType } from './posts/posts.type';
@Entity()
export class Bloggers {
  @PrimaryColumn()
  id: string;
  @Column()
  name: string;
  @Column()
  youtubeUrl: string;

  /*   @OneToMany(() => Post, (post) => post.blogger)
  post: Post[]; */
}

@Entity()
export class Posts {
  @PrimaryColumn()
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column()
  bloggerId: string;
  @Column()
  bloggerName: string;
  @Column()
  addedAt: Date;

  /* @ManyToOne(() => Blogger, (blogger) => blogger.post)
  blogger: Blogger; */
}

@Entity()
export class LikeComments {
  @PrimaryColumn()
  commentsId: string;
  @Column()
  userId: string;
  @Column()
  myStatus: string;
  @Column()
  addedAt: Date;
  @Column()
  login: string;
}

@Entity()
export class Comments {
  @PrimaryColumn()
  id: string;
  @Column()
  content: string;
  @Column()
  userId: string;
  @Column()
  userLogin: string;
  @Column()
  addedAt: Date;
  @Column()
  postId: string;
}

@Entity()
export class Users {
  @PrimaryColumn()
  id: string;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  passwordHash: string;
  @Column()
  passwordSalt: string;
  @Column()
  createdAt: Date;
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;
  @Column()
  isConfirmed: boolean;
}

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  token: string;
}

@Entity()
export class LikePosts {
  @PrimaryColumn()
  postsId: string;
  @Column()
  userId: string;
  @Column()
  myStatus: string;
  @Column()
  addedAt: Date;
  @Column()
  login: string;
}
