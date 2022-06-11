export interface AuthSigninPayloadDto {
    username: string;
    password: string;
  }
  
  export enum LOGIN_PROVIDER {
    PASSWORD = 'PASSWORD',
    FACEBOOK = 'FACEBOOK',
    GOOGLE = 'GOOGLE',
  }

  export interface UserResponseDto{
    id: number,
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    email: string;
    phone: number;
    loginProvider: LOGIN_PROVIDER;
    token?: string;
    createdAt: Date;
    updatedAt?: Date;
  }
  