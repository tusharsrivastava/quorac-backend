import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ActionType } from '../post.enums';
import { Post } from './post.entity';

@Entity()
@Unique('post_user_action', ['post', 'user', 'actionType'])
export class PostAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, { eager: true })
  @JoinColumn()
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  actionType: ActionType;

  @CreateDateColumn()
  actionOn: Date;
}
