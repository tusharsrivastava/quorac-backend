import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SALT_OR_ROUNDS } from 'src/global.constants';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  readonly saltOrRounds = SALT_OR_ROUNDS;

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async createOne(user: CreateUserDto): Promise<User | undefined> {
    const userEntity: User = this.repo.create(user);
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
      username: username,
    });
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.repo.findOneOrFail(id);
  }

  async listAll(): Promise<User[]> {
    return this.repo.find();
  }
}
