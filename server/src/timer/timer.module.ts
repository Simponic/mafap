import { Module } from '@nestjs/common';
import { TimerGateway } from './timer.gateway';
import { TimerController } from './timer.controller';
import { TimerService } from './timer.service';

@Module({
  providers: [TimerGateway, TimerService],
  controllers: [TimerController]
})
export class TimerModule {}
