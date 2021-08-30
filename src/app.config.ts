import { plainToClass } from 'class-transformer';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import {
  IsNumber,
  IsIn,
  validateSync,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ConfigService } from '@nestjs/config';

const enviroments = ['development', 'test', 'production'] as const;
const databases = ['mysql', 'mariadb', 'postgres', 'mssql'] as const;
type Database = typeof databases[number];
type Environment = typeof enviroments[number];

class EnvironmentVariables {
  @IsIn(enviroments)
  NODE_ENV: Environment;

  @IsIn(databases)
  DB_TYPE: Database;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_SCHEMA: string;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsBoolean()
  DB_LOGGING: boolean;
}

export class AppConfig {
  private static get env(): EnvironmentVariables {
    return plainToClass(EnvironmentVariables, process.env, {
      enableImplicitConversion: true,
    });
  }

  public static getTypeOrmConfigAsync(): TypeOrmModuleAsyncOptions {
    return <TypeOrmModuleAsyncOptions>{
      imports: [ConfigService],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: configService.get<Database>('DB_TYPE'),
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),

          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_SCHEMA'),

          entities: ['dist/**/*.entity.js'],
          migrations: ['dist/migrations/*.js'],
          cli: {
            migrationsDir: 'dist/migrations',
          },
          synchronize: true,
          logging: configService.get<boolean>('DB_LOGGING'),
        };
      },
    };
  }

  public static getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: this.env.DB_TYPE,
      host: this.env.DB_HOST,
      port: this.env.DB_PORT,

      username: this.env.DB_USER,
      password: this.env.DB_PASSWORD,
      database: this.env.DB_SCHEMA,

      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/migrations/*.js'],
      cli: {
        migrationsDir: 'src/migrations',
      },
      synchronize: true,
      logging: this.env.DB_LOGGING,
    };
  }

  public static validateConfig(config: Record<string, unknown>) {
    const validatedConfig = plainToClass(EnvironmentVariables, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return validatedConfig;
  }
}
