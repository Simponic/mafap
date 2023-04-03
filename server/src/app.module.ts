import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TimerModule } from './timer/timer.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, TimerModule, AuthModule],
})
export class AppModule {}
