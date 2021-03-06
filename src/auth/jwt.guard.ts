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
    const req = context.switchToHttp().getRequest();
    if (isAnonymousAllowed && !req.headers.authorization) {
      return true;
    }
    // const req = context.switchToHttp().getRequest();
    // const isSocialHeader = req.headers['x-social'];
    // const isSocialAuth =
    //   isSocialHeader !== undefined &&
    //   isSocialHeader !== null &&
    //   isSocialHeader === 'true';

    // if (isSocialAuth) {
    //   return true;
    // }

    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err, user, info) {
    console.log(err, user);
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
