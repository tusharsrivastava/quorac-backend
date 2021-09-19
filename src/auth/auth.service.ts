import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  private anonymousUser;

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.getAnonymousUser().then((user) => {
      this.anonymousUser = user;
    });
  }

  get AnonymousUser() {
    return this.anonymousUser;
  }

  async authenticate(
    username: string,
    password: string,
  ): Promise<UserDto | undefined> {
    const user = await this.userService.findOneByUsernameAndPassword(
      username,
      password,
    );
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userDto } = user;
      return userDto;
    }
    return undefined;
  }

  async loginOrRegister(user: any) {
    let localUser;
    try {
      const username = user.username || user.email.split('@')[0];
      localUser = await this.userService.findOneByUsername(
        username,
        false,
        true,
      );
    } catch (error) {
      // User not found let's create it
      const firstName = user.firstName || user.name.split(' ')[0];
      const lastName = user.lastName || user.name.split(' ')[1];

      localUser = await this.register(<CreateUserDto>{
        username: user.username || user.email.split('@')[0],
        password: user.password || '',
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        profileThumbnail: user.picture,
      });
    }

    return await this.login(localUser);
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: CreateUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newUser } = await this.userService.createOne(user);
    return newUser;
  }

  async getProfile(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.userService.findOneById(userId);
    return user;
  }

  private async getAnonymousUser() {
    let anonymousUser = null;
    try {
      anonymousUser = await this.userService.findOneByUsername('anonymous');
    } catch (error) {
      // User not found let's create it
      anonymousUser = await this.userService.createOne(<CreateUserDto>{
        username: 'anonymous',
        password: 'anonymous',
        firstName: 'Anonymous',
        lastName: 'User',
      });
    }
    return anonymousUser;
  }
}
