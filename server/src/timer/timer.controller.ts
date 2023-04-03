import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Query,
  NotFoundException,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { TimerService } from './timer.service';
import { AuthService } from '../auth/auth.service';
import { CreateTimerDTO, RetrieveFriendDTO } from '../dto/dtos';
import { AuthGuard } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';

@Controller('timers')
@UseGuards(AuthGuard)
export class TimerController {
  constructor(
    private readonly timerService: TimerService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  public async getAllTimers() {
    return this.timerService.getAll();
  }

  @Get('/friend')
  public async getFriendTimers(@Query() { name }: RetrieveFriendDTO) {
    const friend = await this.authService.findFriendByName(name);
    if (!friend) throw new NotFoundException('Friend not found with that name');
    return this.timerService.friendTimers(friend);
  }

  @Post()
  public async createTimer(@Body() { name }: CreateTimerDTO, @Req() req) {
    const referencedFriendIds = Array.from(
      new Set(
        [...name.matchAll(/\@<(\d+)>/g)].map(([_match, id]) =>
          parseInt(id, 10),
        ),
      ),
    );

    if (referencedFriendIds.length > 10)
      throw new BadRequestException(
        'Can link no more than 10 unique friends to timer',
      );

    try {
      return await this.timerService.createTimerWithFriends(
        {
          name,
          created_by: {
            connect: {
              id: req.friend.id,
            },
          },
        },
        referencedFriendIds,
      );
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new BadRequestException('Timer with name already exists');

      throw e;
    }
  }
}
