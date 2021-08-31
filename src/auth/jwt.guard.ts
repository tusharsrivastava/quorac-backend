import {
  ExecutionContext,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_ANONYMOUS_META_KEY } from './auth.decorators';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Optional() protected readonly options: AuthModuleOptions,
    private readonly reflector: Reflector,
  ) {
    super(options);
  }

  canActivate(context: ExecutionContext) {
    const isAnonymousAllowed = this.reflector.get<boolean>(
      ALLOW_ANONYMOUS_META_KEY,
      context.getHandler(),
    );
    if (isAnonymousAllowed) {
      return true;
    }
    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
