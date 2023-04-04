import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthService } from './auth.service';

const parseCookie = (str) =>
  str
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

/* Shamelessly stolen from https://github.com/nestjs/nest/issues/882#issuecomment-632698668 */
export class AuthenticatedSocketIoAdapter extends IoAdapter {
  private readonly authService: AuthService;
  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthService);
  }

  createIOServer(port: number, options?: any): any {
    options.allowRequest = async (request, allowFunction) => {
      let verified = false;

      try {
        const { god_token } = parseCookie(request.headers.cookie);

        const godToken = await this.authService.findGodTokenWithFriend(
          god_token,
        );
        if (godToken && godToken.expiration.getTime() > new Date().getTime())
          verified = true;
      } catch (e) {
        verified = false;
      }

      if (verified) {
        return allowFunction(null, true);
      }

      return allowFunction('Unauthorized', false);
    };

    return super.createIOServer(port, options);
  }
}
