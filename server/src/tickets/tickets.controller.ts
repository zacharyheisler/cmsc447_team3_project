import { Controller, Get, Post, Patch, Param, Body, Query, Delete } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  // GET /tickets
  @Get()
  getTickets(@Query('userId') userId?: string, @Query('agentId') agentId?: string) {
    return this.ticketsService.getTickets(Number(userId), Number(agentId));
  }

  @Get('agent-by-user/:userId')
  async getAgentByUserId(@Param('userId') userId: string) {
    return this.ticketsService.getAgentByUserId(Number(userId));
  }

  // GET /tickets/:id
  @Get(':id')
  getTicketById(@Param('id') id: string) {
    return this.ticketsService.getTicketById(Number(id));
  }

  // POST /tickets
  @Post()
  createTicket(@Body() body: any) {
    return this.ticketsService.createTicket(body);
  }

  // PATCH /tickets/:id
  @Patch(':id')
  updateTicket(@Param('id') id: string, @Body() body: any) {
    return this.ticketsService.updateTicket(Number(id), body);
  }

  // GET /tickets/:id/messages
  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    return this.ticketsService.getMessages(Number(id));
  }

  // POST /tickets/:id/messages
  @Post(':id/messages')
  addMessage(@Param('id') id: string, @Body() body: any) {
    return this.ticketsService.addMessage(Number(id), body);
  }


  // GET /tickets/:id/history
  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.ticketsService.getHistory(Number(id));
  }

  // POST /tickets/:id/history
  @Post(':id/history')
  addStatusHistory(@Param('id') id: string, @Body() body: any) {
    return this.ticketsService.addStatusHistory(Number(id), body);
  }

  @Delete(':id')
  deleteTicket(@Param('id') id: string) {
    return this.ticketsService.deleteTicket(Number(id));
  }
}