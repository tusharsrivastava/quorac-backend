export class CreateUserDto {
  id?: string;
  username: string;
  password: string;
  profileThumbnail?: string;
  firstName: string;
  lastName: string;
  isVerified?: boolean;
}
