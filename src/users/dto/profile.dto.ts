import { PartialType } from '@nestjs/mapped-types';
import {
  EducationInfo,
  Gender,
  Hobby,
  Language,
  WorkInfo,
} from '../entities/profile.entity';

export class ProfileDto {
  works: WorkInfo[];
  educations: EducationInfo[];
  hobbies: Hobby[];
  languages: Language[];
  gender: Gender;
}

export class UpdateProfileDto extends PartialType(ProfileDto) {}

export class CompanyDto {
  name: string;
}

export class UpdateCompanyDto extends PartialType(CompanyDto) {}

export class SchoolDto {
  name: string;
}

export class UpdateSchoolDto extends PartialType(SchoolDto) {}
