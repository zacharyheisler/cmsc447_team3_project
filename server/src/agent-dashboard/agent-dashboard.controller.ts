import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AgentDashboardService } from './agent-dashboard.service';

@Controller('agent-dashboard')
export class AgentDashboardController {
  constructor(private readonly agentDashboardService: AgentDashboardService) {}

  // GET /agent-dashboard/agents
  @Get('agents')
  getAgents() {
    return this.agentDashboardService.getAgents();
  }

  // GET /agent-dashboard/:agentId
  @Get(':agentId')
  getDashboard(@Param('agentId', ParseIntPipe) agentId: number) {
    return this.agentDashboardService.getDashboard(agentId);
  }

  // GET /agent-dashboard/:agentId/summary
  @Get(':agentId/summary')
  getSummary(@Param('agentId', ParseIntPipe) agentId: number) {
    return this.agentDashboardService.getSummary(agentId);
  }

  // GET /agent-dashboard/:agentId/tickets
  @Get(':agentId/tickets')
  getAssignedTickets(@Param('agentId', ParseIntPipe) agentId: number) {
    return this.agentDashboardService.getAssignedTickets(agentId);
  }

  // GET /agent-dashboard/:agentId/activity
  @Get(':agentId/activity')
  getRecentActivity(@Param('agentId', ParseIntPipe) agentId: number) {
    return this.agentDashboardService.getRecentActivity(agentId);
  }
}
