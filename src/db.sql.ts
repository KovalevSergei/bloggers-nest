import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { bloggersDBType } from './bloggers/bloggers.type';
import { likeComments } from './comments/comments.type';
import { likePosts, postsDBType } from './posts/posts.type';
@Entity()
export class Bloggers {
  @PrimaryColumn({ name: 'id', type: 'varchar', nullable: false })
  id: string;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'youtubeUrl', type: 'varchar', nullable: false })
  youtubeUrl: string;

  @OneToMany(() => Posts, (posts) => posts.blogger)
  posts: Posts[];
}

@Entity()
export class Posts {
  @PrimaryColumn({ name: 'id', type: 'varchar', nullable: false })
  id: string;

  @Column({ name: 'title', type: 'varchar', nullable: false })
  title: string;

  @Column({ name: 'shortDescription', type: 'varchar', nullable: false })
  shortDescription: string;

  @Column({ name: 'content', type: 'varchar', nullable: false })
  content: string;

  @Column({ name: 'addedAt', type: 'timestamp', nullable: false })
  addedAt: Date;

  @ManyToOne(() => Bloggers, (blogger) => blogger.posts)
  blogger: Bloggers;

  @OneToMany(() => Comments, (comment) => comment.post)
  comment: Comments[];

  @OneToMany(() => LikePosts, (likeposts) => likeposts.posts)
  likeposts: likePosts[]; //likeposts_posts
}
@Entity()
export class Users {
  @PrimaryColumn({ name: 'id', type: 'varchar', nullable: false })
  id: string;

  @Column({ name: 'login', type: 'varchar', nullable: false })
  login: string;

  @Column({ name: 'email', type: 'varchar', nullable: false })
  email: string;

  @Column({ name: 'passwordHash', type: 'varchar', nullable: false })
  passwordHash: string;

  @Column({ name: 'passwordSalt', type: 'varchar', nullable: false })
  passwordSalt: string;

  @Column({ name: 'createdAt', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Column({ name: 'confirmationCode', type: 'varchar', nullable: false })
  confirmationCode: string;

  @Column({ name: 'expirationDate', type: 'timestamp', nullable: false })
  expirationDate: Date;

  @Column({ name: 'isConfirmed', type: 'boolean', nullable: false })
  isConfirmed: boolean;

  @OneToMany(() => Comments, (comment) => comment.user)
  comment: Comments[];

  @OneToMany(() => LikeComments, (likeComments) => likeComments.users)
  likeComments: LikeComments[];

  @OneToMany(() => LikePosts, (likeposts) => likeposts.posts)
  likeposts: LikePosts[];
}
@Entity()
export class Token {
  @PrimaryColumn({ name: 'token', type: 'varchar', nullable: false })
  token: string;
}
@Entity()
export class Comments {
  @PrimaryColumn({ name: 'id', type: 'varchar', nullable: false })
  id: string;

  @Column({ name: 'content', type: 'varchar', nullable: false })
  content: string;

  @Column({ name: 'addedAt', type: 'timestamp', nullable: false })
  addedAt: Date;

  @ManyToOne(() => Posts, (post) => post.comment)
  post: Posts;

  @ManyToOne(() => Users, (user) => user.comment)
  user: Users;

  @OneToMany(() => LikeComments, (likeComments) => likeComments.comments)
  likeComments: LikeComments[];
}
@Entity()
export class LikeComments {
  /*   @PrimaryGeneratedColumn('identity')
  id: number; */

  @Column({ name: 'myStatus', type: 'varchar', nullable: false })
  myStatus: string;

  @PrimaryColumn({ name: 'addedAt', type: 'timestamp', nullable: false })
  addedAt: Date;

  @ManyToOne(() => Comments, (comments) => comments.likeComments)
  comments: Comments;

  @ManyToOne(() => Users, (users) => users.likeComments)
  users: Users;
}

@Entity({ name: 'likeposts' })
export class LikePosts {
  @Column({ name: 'myЫtatus', type: 'varchar', nullable: false })
  myStatus: string;

  @PrimaryColumn({ name: 'addedAt', type: 'timestamp', nullable: false })
  addedAt: Date;

  @ManyToOne(() => Users, (users) => users.likeposts)
  users: Users;

  @ManyToOne(() => Posts, (posts) => posts.likeposts)
  posts: Posts;
}
