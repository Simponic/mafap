import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  NotFoundException,
  BadRequestException,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';

import { readKey, readCleartextMessage, verify } from 'openpgp';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

import { RetrieveFriendDTO, SignedGodTokenDTO } from '../dto/dtos';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get('/logout')
  async logout(@Res({ passthrough: true }) res, @Req() req) {
    res.cookie('god_token', '', {
      maxAge: -1,
      path: '/',
    });
    return await this.authService.deleteToken(req.token);
  }

  @UseGuards(AuthGuard)
  @Get('/friends')
  public async allFriends() {
    return await this.authService.allFriends();
  }

  @Get('/')
  public async makeGodToken(@Query() { name, id }: RetrieveFriendDTO) {
    const friend = await this.authService.findFriendByNameOrId(name, id);
    if (!friend) throw new NotFoundException('Friend not found by that query');

    return await this.authService.createTokenForFriend(friend);
  }

  @Post()
  public async verifyFriend(
    @Res({ passthrough: true }) res,
    @Body() { signature }: SignedGodTokenDTO,
  ) {
    let signatureObj;
    try {
      signatureObj = await readCleartextMessage({
        cleartextMessage: signature,
      });
    } catch (e) {
      throw new BadRequestException('Invalid PGP Signature');
    }
    const { text: token } = signatureObj;

    const referencedToken = await this.authService.findGodTokenWithFriend(
      token,
    );
    if (!referencedToken)
      throw new NotFoundException('Could not find God Token to sign');
    if (referencedToken.signed)
      throw new BadRequestException(
        'God Token was already signed - no replay attacks plz',
      );

    const { friend } = referencedToken;
    const publicKeyObj = await readKey({ armoredKey: friend.public_key });
    const verificationResult = await verify({
      message: signatureObj,
      verificationKeys: publicKeyObj,
    });

    const { verified } = verificationResult.signatures[0];
    if (await verified) {
      res.cookie('god_token', token, {
        httpOnly: true,
        path: '/',
        expires: referencedToken.expiration,
      });

      return { ...(await this.authService.signToken(token)), friend };
    }

    throw new BadRequestException(
      "PGP signature could not be verified with user's public key",
    );
  }
}
