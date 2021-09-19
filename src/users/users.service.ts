import { Injectable } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { SALT_OR_ROUNDS } from 'src/global.constants';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileDto, UpdateProfileDto } from './dto/profile.dto';
import {
  Company,
  EducationInfo,
  Hobby,
  Language,
  Profile,
  School,
  WorkInfo,
} from './entities/profile.entity';

@Injectable()
export class UsersService {
  readonly saltOrRounds = SALT_OR_ROUNDS;

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(WorkInfo)
    private readonly workInfoRepo: Repository<WorkInfo>,
    @InjectRepository(EducationInfo)
    private readonly educationInfoRepo: Repository<EducationInfo>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Language)
    private readonly languageRepo: Repository<Language>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(Hobby)
    private readonly hobbyRepo: Repository<Hobby>,
  ) {}

  async createOne(user: CreateUserDto): Promise<User | undefined> {
    const userEntity: User = this.repo.create(user);
    userEntity.updatePassword = true;
    return this.repo.save(userEntity);
  }

  async findOneByUsernameAndPassword(
    username: string,
    password: string,
  ): Promise<User | undefined> {
    const user = await this.findOneByUsername(username, true);
    if (user) {
      const isMatch = await user.isValidPassword(password);

      if (isMatch) {
        return await this.findOneById(user.id);
      }
    }
    return undefined;
  }

  async findOneByUsername(
    username: string,
    fetchPassword = false,
  ): Promise<User | undefined> {
    if (fetchPassword) {
      return this.repo.findOneOrFail({
        select: ['id', 'username', 'password'],
        where: { username },
      });
    }
    return this.repo.findOneOrFail({
      relations: ['profile'],
      where: {
        username: username,
      },
    });
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.repo.findOneOrFail(id, { relations: ['profile'] });
  }

  async listAll(): Promise<User[]> {
    return this.repo.find();
  }

  async createProfile(
    userId: string,
    profileDto: ProfileDto | UpdateProfileDto,
  ) {
    const user = await this.findOneById(userId);
    if (user.profile !== null) {
      return await this.updateProfile(userId, profileDto);
    }
    const { works, educations, ...rest } = profileDto;
    const profile = this.profileRepo.create(rest);
    await this.profileRepo.save(profile);
    const workInfos = works.map((work) =>
      this.workInfoRepo.create({ ...work, profile: profile }),
    );
    const educationInfos = educations.map((education) =>
      this.educationInfoRepo.create({ ...education, profile: profile }),
    );
    await this.workInfoRepo.save(workInfos);
    await this.educationInfoRepo.save(educationInfos);
    user.profile = profile;
    await this.repo.save(user);
    return await this.repo.findOne(userId, { relations: ['profile'] });
  }

  async updateProfile(userId: string, profileDto: UpdateProfileDto) {
    const user = await this.findOneById(userId);
    if (user.profile === null) {
      return await this.createProfile(userId, profileDto);
    }
    const { works, educations, ...rest } = profileDto;
    await this.profileRepo.update(user.profile.id, rest);

    if (works && Array.isArray(works)) {
      await Promise.all(
        works.map(async (work) => {
          if (work.id) {
            return await this.workInfoRepo.update(work.id, work);
          } else {
            return await this.workInfoRepo.create({
              ...work,
              profile: user.profile,
            });
          }
        }),
      );
    }
    if (educations && Array.isArray(educations)) {
      await Promise.all(
        educations.map(async (education) => {
          if (education.id) {
            return await this.educationInfoRepo.update(education.id, education);
          } else {
            return await this.educationInfoRepo.create({
              ...education,
              profile: user.profile,
            });
          }
        }),
      );
    }

    return await this.repo.findOne(userId, { relations: ['profile'] });
  }

  async listCompanies({
    term = '',
    page = 1,
    limit = 10,
  }: {
    term?: string;
    page?: number;
    limit?: number;
  }) {
    let whereClause = null;
    if (term) {
      whereClause = {
        name: ILike(`${term}%`),
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [data, _count] = await this.companyRepo.findAndCount({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
    });
    return data;
  }

  async listLanguages({
    term = '',
    page = 1,
    limit = 10,
  }: {
    term?: string;
    page?: number;
    limit?: number;
  }) {
    let whereClause = null;
    if (term) {
      whereClause = {
        name: ILike(`${term}%`),
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [data, _count] = await this.languageRepo.findAndCount({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
    });
    return data;
  }

  async listSchools({
    term = '',
    page = 1,
    limit = 10,
  }: {
    term?: string;
    page?: number;
    limit?: number;
  }) {
    let whereClause = null;
    if (term) {
      whereClause = {
        name: ILike(`${term}%`),
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [data, _count] = await this.schoolRepo.findAndCount({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
    });
    return data;
  }

  async listHobbies({
    term = '',
    page = 1,
    limit = 10,
  }: {
    term?: string;
    page?: number;
    limit?: number;
  }) {
    let whereClause = null;
    if (term) {
      whereClause = {
        name: ILike(`${term}%`),
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [data, _count] = await this.hobbyRepo.findAndCount({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
    });
    return data;
  }
}
