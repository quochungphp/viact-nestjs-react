/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/lines-between-class-members */
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

type TypeOrmConfig = TypeOrmModuleOptions & {
  seeds: string[];
  factories: string[];
};
@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    this.envConfig = dotenv.parse(fs.readFileSync('.env')) as unknown as {
      [key: string]: string;
    };
  }
  private int(value: string | undefined, number: number): number {
    return value
      ? Number.isNaN(Number.parseInt(value))
        ? number
        : Number.parseInt(value)
      : number;
  }

  private bool(value: string | undefined, boolean: boolean): boolean {
    return value === null || value === undefined ? boolean : value === 'true';
  }

  private cors(value: string | undefined): string[] | 'all' {
    if (value === 'all' || value === undefined) {
      return 'all';
    }

    return value
      ? value.split(',').map((name) => name.trim())
      : ['http://localhost:3000'];
  }
  get timeToLive(): number {
    return this.int(
      this.envConfig[
        process.env.REDIS_CACHE_EXPIRES_IN || 'REDIS_CACHE_EXPIRES_IN'
      ],
      60 * 60 * 24 * 7,
    );
  }
  get jwtSecret(): string {
    return process.env.JWT_SECRET || this.envConfig['JWT_SECRET'] || 'test';
  }

  get accessTokenExpiry(): string {
    return (
      process.env.ACCESS_TOKEN_EXPIRY ||
      this.envConfig['ACCESS_TOKEN_EXPIRY'] ||
      '7d'
    );
  }
  get saltRounds(): number {
    return this.int(
      process.env.SALT_ROUNDS || this.envConfig['SALT_ROUNDS'],
      10,
    );
  }
  get preHashSalt(): string {
    return (
      process.env.PRE_HASH_SALT ||
      this.envConfig['PRE_HASH_SALT'] ||
      'test-hash'
    );
  }
  get env(): string {
    return this.envConfig['environment'] || 'local';
  }

  get backendBaseUrl(): string {
    return (
      this.envConfig['backendBaseUrl'] ||
      'http://localhost:' + this.port + '/' + this.apiVersion
    );
  }
  get apiKey(): string {
    return this.envConfig['apiKey'] || '';
  }

  get host(): string {
    return this.envConfig['host'] || '127.0.0.1';
  }

  get port(): number {
    return this.int(this.envConfig['port'], 8282);
  }

  get corsAllowedOrigins(): string[] | string {
    return this.cors(this.envConfig['corsAllowedOrigins'] || 'all');
  }

  get corsEnabled(): boolean {
    return this.bool(this.envConfig['corsEnabled'], true);
  }

  get environment(): string {
    return this.envConfig['environment'] || 'dev';
  }

  get apiVersion(): string {
    return this.envConfig['apiVersion'] || 'api/v1';
  }

  get region(): string {
    return this.envConfig['region'] || 'us-east-1';
  }

  get isIntegrationTest(): boolean {
    return this.bool(this.envConfig['isIntegrationTest'], false);
  }

  get mysqlPort(): number {
    return this.int(this.envConfig['mysqlPort'], 3306);
  }
  get mysqlPassword(): string {
    return this.envConfig['mysqlPassword'] || 'password';
  }
  get mysqlUsername(): string {
    return this.envConfig['mysqlUsername'] || 'user';
  }
  get mysqlHost(): string {
    return this.envConfig['mysqlHost'] || 'localhost';
  }
  get mysqlDatabase(): string {
    return this.envConfig['mysqlDatabase'] || 'database';
  }

  get mysqlEnableTypeOrmLog(): boolean {
    return this.bool(this.envConfig['mysqlEnableTypeOrmLog'], true);
  }

  get mysqlConfig(): TypeOrmConfig {
    const entities = [
      path.join(__dirname + '/../../../**/*.entity{.ts,.js}'),
      path.join(__dirname + '/../../../**/*.view-entity{.ts,.js}'),
    ];
    const migrations = [
      path.join(__dirname + '/../../../../database/migrations/*{.ts,.js}'),
    ];
    const seeds = [path.join(__dirname + '/../../../**/*.seed{.ts,.js}')];
    const factories = [
      path.join(__dirname + '/../../../**/*.factory{.ts,.js}'),
    ];
    const config: TypeOrmConfig = {
      entities,
      migrations,
      type: 'mysql',
      host: this.mysqlHost,
      port: this.mysqlPort,
      username: this.mysqlUsername,
      password: this.mysqlPassword,
      database: this.mysqlDatabase,
      synchronize: false,
      subscribers: [],
      cli: {
        migrationsDir: 'src/database/migrations', // only effect in local development
      },
      migrationsRun: false,
      seeds,
      factories,
      logging: this.mysqlEnableTypeOrmLog,
    };
    return config;
  }
}
