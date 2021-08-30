export class CreateUserDto {
  id?: string;
  email: string;
  username: string;
  password: string;
  profileThumbnail?: string;
  firstName: string;
  lastName: string;
  isVerified?: boolean;
}
