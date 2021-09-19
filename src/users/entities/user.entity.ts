import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SALT_OR_ROUNDS } from 'src/global.constants';
import { Profile } from './profile.entity';

const saltOrRounds = SALT_OR_ROUNDS;

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ type: 'varchar', length: 300, nullable: true, default: null })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  profileThumbnail: string;

  @Column({ default: 1 })
  level: number;

  @Column({ type: 'varchar', length: 300, nullable: true, default: null })
  description: string;

  @Column({ default: 0 })
  followersCount: number;

  @Column({ default: 0 })
  followingCount: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: false })
  isVerified: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
  })
  @JoinColumn()
  profile: Profile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  updatePassword = false;
  isFollowed: false;
  isMe: false;

  async isValidPassword(plainPassword: string) {
    return await bcrypt.compare(plainPassword, this.password);
  }

  @BeforeUpdate()
  async procBeforeUpdate() {
    console.log('Before Update Triggered');
    await this.updatePasswordHash();
  }

  @BeforeInsert()
  async procBeforeInsert() {
    console.log('Before Insert Triggered');
    await this.updatePasswordHash();
  }

  async updatePasswordHash() {
    if (this.updatePassword) {
      this.password = await bcrypt.hash(this.password, saltOrRounds);
    }
  }
}

@Entity()
@Unique('user_follow_unique', ['user', 'followed'])
export class UserFollower {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  followed: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
