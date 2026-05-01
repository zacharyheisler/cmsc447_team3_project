import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AgentDashboardController } from './agent-dashboard.controller';
import { AgentDashboardService } from './agent-dashboard.service';

@Module({
  controllers: [AgentDashboardController],
  providers: [AgentDashboardService, PrismaService],
})
export class AgentDashboardModule {}
