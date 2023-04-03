import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  exports: [AuthGuard, AuthService],
  providers: [AuthService, AuthGuard],
})
export class AuthModule {}
