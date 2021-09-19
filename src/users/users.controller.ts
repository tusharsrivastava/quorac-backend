import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ProfileDto, UpdateProfileDto } from './dto/profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async profile(@Request() req) {
    try {
      console.log('profile', req.user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = await this.userService.findOneByUsername(
        req.user.username,
      );
      return user;
    } catch {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async createOrUpdateProfile(
    @Request() req,
    @Body() profileDto: ProfileDto | UpdateProfileDto,
  ) {
    try {
      const user = await this.userService.findOneByUsername(req.user.username);
      return await this.userService.createProfile(user.id, profileDto);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('companies')
  async listCompanies(
    @Query('term') term: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.userService.listCompanies({ term, page, limit });
  }

  @Get('schools')
  async listSchools(
    @Query('term') term: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.userService.listSchools({ term, page, limit });
  }

  @Get('hobbies')
  async listHobbies(
    @Query('term') term: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.userService.listHobbies({ term, page, limit });
  }

  @Get('languages')
  async listLanguages(
    @Query('term') term: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.userService.listLanguages({ term, page, limit });
  }

  @Get(':username')
  async profileByUsername(@Param('username') username: string) {
    return await this.userService.findOneByUsername(username);
  }
}
