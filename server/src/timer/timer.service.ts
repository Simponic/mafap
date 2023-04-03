import { Friend, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimerService {
  constructor(private readonly prismaService: PrismaService) {}

  public getAll() {
    return this.prismaService.timer.findMany({
      select: {
        id: true,
        name: true,
        start: true,
        referenced_friends: {
          select: {
            name: true,
            id: true,
          },
        },
        created_by: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
  }

  public friendTimers(friend: Friend) {
    return this.prismaService.timer.findMany({
      select: {
        id: true,
        name: true,
        start: true,
        referenced_friends: {
          where: {
            id: friend.id,
          },
          select: {
            id: true,
            name: true,
          },
        },
        created_by: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
  }

  public createTimerWithFriends(
    timer: Prisma.TimerCreateInput,
    friendIds: number[],
  ) {
    if (friendIds.length > 0)
      return this.prismaService.timer.create({
        data: {
          ...timer,
          referenced_friends: {
            connect: friendIds.map((id) => ({ id })),
          },
        },
      });
    return this.prismaService.timer.create({ data: timer });
  }
}
