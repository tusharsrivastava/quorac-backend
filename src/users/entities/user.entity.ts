import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SALT_OR_ROUNDS } from 'src/global.constants';

const saltOrRounds = SALT_OR_ROUNDS;

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ type: 'varchar', length: 300, nullable: true, default: null })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  profileThumbnail: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

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
    this.password = await bcrypt.hash(this.password, saltOrRounds);
  }
}
