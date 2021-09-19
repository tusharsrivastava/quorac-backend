import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

@Entity()
export class Hobby {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Profile, (profile) => profile.hobbies)
  profiles: Profile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class Language {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Profile, (profile) => profile.languages)
  profiles: Profile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @OneToMany(() => WorkInfo, (workInfo) => workInfo.profile, {
    eager: true,
    cascade: true,
  })
  works: WorkInfo[];

  @OneToMany(() => EducationInfo, (edInfo) => edInfo.profile, {
    eager: true,
    cascade: true,
  })
  educations: EducationInfo[];

  @ManyToMany(() => Hobby, (hobby) => hobby.profiles, {
    eager: true,
    cascade: true,
  })
  @JoinTable()
  hobbies: Hobby[];

  @ManyToMany(() => Language, (lang) => lang.profiles, {
    eager: true,
    cascade: true,
  })
  @JoinTable()
  languages: Language[];

  @Column()
  gender: Gender;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => WorkInfo, (workInfo) => workInfo.company)
  workInfos: WorkInfo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class WorkInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Profile, (profile) => profile.works)
  @JoinColumn()
  profile: Profile;

  @ManyToOne(() => Company, (company) => company.workInfos, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => EducationInfo, (educationInfo) => educationInfo.school)
  educations: EducationInfo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class EducationInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Profile, (profile) => profile.educations)
  @JoinColumn()
  profile: Profile;

  @ManyToOne(() => School, (school) => school.educations, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  school: School;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
