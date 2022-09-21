import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { bloggersDBType } from './bloggers/bloggers.type';
import { likeComments } from './comments/comments.type';
import { likePosts, postsDBType } from './posts/posts.type';
@Entity()
export class Bloggers {
  @PrimaryColumn()
  id: string;
  @Column()
  name: string;
  @Column()
  youtubeUrl: string;

  @OneToMany(() => Posts, (posts) => posts.blogger)
  posts: Posts[];
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
  /*  @ManyToOne(() => Bloggers)
  blogger: Bloggers; */
  @Column({ nullable: false })
  addedAt: Date;
  @ManyToOne(() => Bloggers, (blogger) => blogger.posts)
  blogger: Bloggers;
  @OneToMany(() => Comments, (comment) => comment.post)
  comment: Comments[];
  @OneToMany(() => LikePosts, (likePosts) => likePosts.posts)
  likePosts: likePosts[];
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
  @OneToMany(() => Comments, (comment) => comment.user)
  comment: Comments[];
  @OneToMany(() => LikeComments, (likeComments) => likeComments.users)
  likeComments: LikeComments[];
  @OneToMany(() => LikePosts, (likePosts) => likePosts.users)
  likePosts: LikePosts[];
}
@Entity()
export class Token {
  @PrimaryColumn()
  token: string;
}
@Entity()
export class Comments {
  @PrimaryColumn()
  id: string;
  @Column()
  content: string;
  @Column()
  addedAt: Date;
  @ManyToOne(() => Posts, (post) => post.comment)
  post: Posts;
  @ManyToOne(() => Users, (user) => user.comment)
  user: Users;
  @OneToMany(() => LikeComments, (likeComments) => likeComments.comments)
  likeComments: likeComments[];
}
@Entity()
export class LikeComments {
  @Column()
  myStatus: string;
  @PrimaryColumn()
  addedAt: Date;
  @ManyToOne(() => Comments, (comments) => comments.likeComments)
  comments: Comments;
  @ManyToOne(() => Users, (users) => users.likeComments)
  users: Users;
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
  @ManyToOne(() => Users, (users) => users.likePosts)
  users: Users;
  @ManyToOne(() => Posts, (posts) => posts.likePosts)
  posts: Posts;
}
