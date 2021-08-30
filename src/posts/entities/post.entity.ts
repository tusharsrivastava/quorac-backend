import {
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

  @Column('text')
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
  numLikes: number;

  @OneToMany(() => Post, (post) => post.parent)
  children: Post[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
