import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Query,
  NotFoundException,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { TimerService } from './timer.service';
import { TimerGateway } from './timer.gateway';
import { AuthService } from '../auth/auth.service';
import {
  RetrieveTimerDTO,
  CreateTimerDTO,
  RetrieveFriendDTO,
  GetPageDTO,
} from '../dto/dtos';
import { AuthGuard } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';

@Controller('timers')
@UseGuards(AuthGuard)
export class TimerController {
  constructor(
    private readonly timerGateway: TimerGateway,
    private readonly timerService: TimerService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  public async getAllTimers() {
    return await this.timerService.getAll();
  }

  @Get('/friend')
  public async getFriendTimers(@Query() { id, name }: RetrieveFriendDTO) {
    const friend = await this.authService.findFriendByNameOrId(name, id);
    if (!friend) throw new NotFoundException('Friend not found by that query');
    return await this.timerService.friendTimers(friend);
  }

  @Get('/:id/refreshes')
  public async getTimerAndRefreshes(
    @Param() { id }: RetrieveTimerDTO,
    @Query() page: GetPageDTO,
  ) {
    const timer = await this.timerService.findTimerById(id);
    if (!timer) throw new NotFoundException('No such timer with id');

    return {
      ...timer,
      timer_refreshes: await this.timerService.getRefreshesPaged(timer, page),
    };
  }

  @Post('/:id/refresh')
  public async refreshTimer(@Param() { id }: RetrieveTimerDTO, @Req() req) {
    const timer = await this.timerService.findTimerById(id);
    if (!timer) throw new NotFoundException('No such timer with id');

    const refreshedTimer = await this.timerService.refreshTimer(
      timer,
      req.friend,
    );
    this.timerGateway.timerRefreshed(refreshedTimer);

    return refreshedTimer;
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

    let timer;
    try {
      timer = await this.timerService.createTimerWithFriends(
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

    this.timerGateway.timerCreated(timer);

    return timer;
  }
}
