import { Injectable } from '@nestjs/common';
import { Friend, Prisma } from '@prisma/client';
import { randomInt } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import words from './words';

export const GOD_TOKEN_EXPIRATION_MS = 420 * 69 * 1000;
export const GOD_TOKEN_LENGTH = 25;

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  private makeGodToken = (godTokenLength = GOD_TOKEN_LENGTH) =>
    Array(godTokenLength)
      .fill(null)
      .map(() => words[randomInt(0, words.length)])
      .join(' ');

  static FRIEND_SELECT = {
    id: true,
    name: true,
  } as Prisma.FriendSelect;

  public allFriends() {
    return this.prismaService.friend.findMany({
      select: AuthService.FRIEND_SELECT,
    });
  }

  public findFriendByName(name: string) {
    return this.prismaService.friend.findUnique({
      where: { name },
    });
  }

  public findFriendByNameOrId(name: string, id: number) {
    let where: Prisma.FriendWhereUniqueInput = { name };
    if (typeof id !== 'undefined') where = { id };
    return this.prismaService.friend.findUnique({
      where,
    });
  }

  public createTokenForFriend(friend: Friend) {
    return this.prismaService.godToken.create({
      data: {
        token: this.makeGodToken(),
        friend_id: friend.id,
        expiration: new Date(new Date().getTime() + GOD_TOKEN_EXPIRATION_MS),
      },
    });
  }

  public deleteToken(token: string) {
    return this.prismaService.godToken.delete({
      where: { token },
    });
  }

  public signToken(token: string) {
    return this.prismaService.godToken.update({
      where: { token },
      data: {
        signed: true,
      },
    });
  }

  public findGodTokenWithFriend(token: string) {
    return this.prismaService.godToken.findUnique({
      where: { token },
      include: {
        friend: true,
      },
    });
  }
}
