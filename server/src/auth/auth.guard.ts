import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req.cookies.god_token) throw new UnauthorizedException('No session');

    const token = await this.authService.findGodTokenWithFriend(
      req.cookies.god_token,
    );

    if (!token) throw new UnauthorizedException('Could not verify session');
    if (new Date().getTime() > token.expiration.getTime())
      throw new UnauthorizedException('Session has expired');

    const { friend } = token;
    req.friend = friend;
    req.token = token.token;

    return true;
  }
}
