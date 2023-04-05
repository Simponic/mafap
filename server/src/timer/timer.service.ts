import { Friend, Timer, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { GetPageDTO } from 'src/dto/dtos';

@Injectable()
export class TimerService {
  constructor(private readonly prismaService: PrismaService) {}

  static TIMER_SELECT = {
    id: true,
    name: true,
    start: true,
  } as Prisma.TimerSelect;

  static INCLUDE_FRIENDS_SELECT = {
    referenced_friends: {
      select: AuthService.FRIEND_SELECT,
    },
    created_by: {
      select: AuthService.FRIEND_SELECT,
    },
  };

  static REFRESHED_SELECT = {
    id: true,
    start: true,
    end: true,
    refreshed_by: {
      select: AuthService.FRIEND_SELECT,
    },
  };

  static LAST_REFRESH = {
    orderBy: {
      end: 'desc',
    },
    take: 1,
    select: TimerService.REFRESHED_SELECT,
  };

  public getAll() {
    return this.prismaService.timer.findMany({
      select: {
        ...TimerService.TIMER_SELECT,
        ...TimerService.INCLUDE_FRIENDS_SELECT,
        timer_refreshes: {
          orderBy: {
            end: 'desc',
          },
          take: 1,
          select: TimerService.REFRESHED_SELECT,
        },
      },
    });
  }

  public friendTimers(friend: Friend) {
    return this.prismaService.timer.findMany({
      select: {
        ...TimerService.TIMER_SELECT,
        ...TimerService.INCLUDE_FRIENDS_SELECT,
        timer_refreshes: {
          orderBy: {
            end: 'desc',
          },
          take: 1,
          select: TimerService.REFRESHED_SELECT,
        },
      },
      where: {
        referenced_friends: {
          some: {
            id: {
              equals: friend.id,
            },
          },
        },
      },
    });
  }

  public async getRefreshesPaged(timer: Timer, { skip, take }: GetPageDTO) {
    return this.prismaService.timerRefreshes.findMany({
      take,
      skip,
      where: {
        timer: {
          id: timer.id,
        },
      },
      select: TimerService.REFRESHED_SELECT,
    });
  }

  public findTimerById(id: number) {
    return this.prismaService.timer.findUnique({
      where: { id },
    });
  }

  public async refreshTimer(timer: Timer, friend: Friend) {
    const now = new Date();

    await this.prismaService.timerRefreshes.create({
      data: {
        start: timer.start,
        end: now,
        refreshed_by: {
          connect: {
            id: friend.id,
          },
        },
        timer: {
          connect: {
            id: timer.id,
          },
        },
      },
      select: TimerService.REFRESHED_SELECT,
    });

    return this.prismaService.timer.update({
      where: { id: timer.id },
      data: {
        start: now,
      },
      select: {
        ...TimerService.TIMER_SELECT,
        ...TimerService.INCLUDE_FRIENDS_SELECT,
        timer_refreshes: {
          orderBy: {
            end: 'desc',
          },
          take: 1,
          select: TimerService.REFRESHED_SELECT,
        },
      },
    });
  }

  public createTimerWithFriends(
    timer: Prisma.TimerCreateInput,
    referencedFriendIds: number[],
  ) {
    const select = {
      ...TimerService.TIMER_SELECT,
      ...TimerService.INCLUDE_FRIENDS_SELECT,
    };
    if (referencedFriendIds.length > 0)
      return this.prismaService.timer.create({
        data: {
          ...timer,
          referenced_friends: {
            connect: referencedFriendIds.map((id) => ({ id })),
          },
        },
        select,
      });

    return this.prismaService.timer.create({
      data: timer,
      select,
    });
  }
}
