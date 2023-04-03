import { Module } from '@nestjs/common';
import { TimerGateway } from './timer.gateway';
import { TimerController } from './timer.controller';
import { TimerService } from './timer.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [TimerGateway, TimerService],
  controllers: [TimerController],
})
export class TimerModule {}
