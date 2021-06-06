import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum UserActivityType {
  VIEW = 'view',
  LIKE = 'like',
  UNLIKE = 'unlike',
  SHARE = 'share',
  COMMENT = 'comment',
}

@Entity()
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'for_id', referencedColumnName: 'id' })
  for: User;

  // @ManyToOne(() => Content)
  // @JoinColumn({ name: 'on_id', referencedColumnName: 'id' })
  // on: Content;

  @Column()
  activity: UserActivityType;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  modifiedOn: Date;

  // After the Operation is updated we will update the content class accordingly
  @BeforeInsert()
  async beforeInsert() {
    console.log('Before Insert Called');
    await this._updateContentStats();
  }

  @BeforeUpdate()
  async beforeUpdate() {
    console.log('Before Update Called');
    await this._updateContentStats();
  }

  private async _updateContentStats() {
    // switch (this.activity) {
    //   case UserActivityType.LIKE:
    //     this.on.stats.likes += 1;
    //     break;
    //   case UserActivityType.UNLIKE:
    //     this.on.stats.likes -= 1;
    //     break;
    //   case UserActivityType.VIEW:
    //     this.on.stats.views += 1;
    //     break;
    //   case UserActivityType.COMMENT:
    //     this.on.stats.comments += 1;
    //     break;
    // }
  }
}
