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
import { Comment } from './comment.entity';

@Entity()
@Unique('comment_user_action', ['comment', 'user', 'actionType'])
export class CommentAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Comment, { eager: true })
  @JoinColumn()
  comment: Comment;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  actionType: ActionType;

  @CreateDateColumn()
  actionOn: Date;
}
