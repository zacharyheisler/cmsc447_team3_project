import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

type AuthenticatedRequest = Request & {
  user: {
    sub: number;
    username: string;
    role: string;
  };
};

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('users/:userId')
  getUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.getUser(userId);
  }

  @Patch('users/:userId')
  updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(userId, dto);
  }

  @Patch('users/:userId/approve')
  approveUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.approveUser(userId, req.user.sub);
  }

  @Patch('users/:userId/deactivate')
  deactivateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.setUserActive(userId, false, req.user.sub);
  }

  @Patch('users/:userId/activate')
  activateUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.setUserActive(userId, true);
  }

  @Patch('users/:userId/role')
  updateUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateRoleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.updateUserRole(userId, dto.role, req.user.sub);
  }

  @Delete('users/:userId')
  deleteUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.deleteUser(userId, req.user.sub);
  }

  @Get('tickets')
  getTickets() {
    return this.adminService.getTickets();
  }

  @Patch('tickets/:ticketId/assign')
  assignTicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() dto: AssignTicketDto,
  ) {
    return this.adminService.assignTicket(ticketId, dto.agentId);
  }

  @Patch('tickets/:ticketId/status')
  updateTicketStatus(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() dto: UpdateTicketStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.updateTicketStatus(ticketId, dto.status, req.user.sub);
  }
}