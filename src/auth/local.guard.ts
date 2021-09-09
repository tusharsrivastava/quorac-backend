import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const isSocialHeader = req.headers['x-social'];
    const isSocialAuth =
      isSocialHeader !== undefined &&
      isSocialHeader !== null &&
      isSocialHeader === 'true';

    if (isSocialAuth) {
      return true;
    }

    return super.canActivate(context);
  }
}
