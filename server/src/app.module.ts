import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { AuthModule } from './auth/auth.module';
import { AgentDashboardModule } from './agent-dashboard/agent-dashboard.module';

@Module({
  imports: [TicketsModule, AuthModule, AgentDashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
