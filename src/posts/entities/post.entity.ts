import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Comment } from './comment.entity';
import { Category } from 'src/categories/entities/category.entity';
import { SubCategory } from 'src/categories/entities/subcategory.entity';

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

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn()
  category: Category;

  @ManyToMany(() => SubCategory, { cascade: ['insert', 'update'] })
  @JoinTable()
  subcategories: SubCategory[];

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

  hasUpvoted = false;
  hasDownvoted = false;

  // @AfterLoad()
  // setProps() {

  // }
}
