import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Comment } from './comment.entity';

export enum PostType {
  ARTICLE = 'article',
  POST = 'post',
  QUESTION = 'question',
  ANSWER = 'answer',
  POLL = 'poll',
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: PostType;

  @Column({ default: 'Untitled Post' })
  title: string;

  @Column('text', { nullable: true })
  content: string;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn()
  parent: Post;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  createdBy: User;

  @Column({ default: 0 })
  upvotes: number;

  @Column({ default: 0 })
  downvotes: number;

  @Column({ default: 0 })
  numComments: number;

  @Column({ default: 0 })
  numAssociatedPosts: number;

  @Column({ default: 0 })
  numLikes: number;

  @OneToMany(() => Post, (post) => post.parent)
  children: Post[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @AfterLoad()
  // setJsonProps() {
  //   if (this.type === PostType.ANSWER) {
  //     this.title = this.parent?.content;
  //   } else if (this.type === PostType.QUESTION) {
  //     this.title = this.content;
  //     if (this.parent === null) {
  //       this.content = '';
  //     }
  //   }
  // }
}
