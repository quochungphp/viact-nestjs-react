import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { omit } from 'lodash';
import { RequestContext } from '../../../utils/request-context';
import { UserDto } from '../../user/dtos/user.dto';
import { AuthAccessTokenDto } from '../dtos/auth-access-token.dto';
import { AuthRefreshTokenDto } from '../dtos/auth-refesh-token.dto';
import { AuthSigninDto } from '../dtos/auth-sign.dto';

@Injectable()
export class AuthSignInAction {
  constructor(private jwtService: JwtService) {}

  async execute(context: RequestContext): Promise<AuthSigninDto> {
    const { correlationId, user } = context;
    if (!user) {
      throw new NotFoundException(
        'User',
        'Username and password are not correct',
      );
    }

    const payloadAccessToken: AuthAccessTokenDto = {
      ...(omit<any>(user, 'password') as any),
      sessionId: correlationId,
    };

    const accessToken = this.jwtService.sign({
      ...payloadAccessToken,
      token: user.token,
    });

    const payloadRefreshToken: AuthRefreshTokenDto = {
      id: payloadAccessToken.id,
      sessionId: correlationId,
    };
    const refreshToken = this.jwtService.sign(payloadRefreshToken);
    const token: AuthSigninDto = {
      user: payloadAccessToken,
      accessToken,
      refreshToken,
    };

    return token;
  }
}
