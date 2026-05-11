import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';

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

    @Patch('users/:userId/approve')
    approveUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('adminUserId', ParseIntPipe) adminUserId: number,
    ) {
    return this.adminService.approveUser(userId, adminUserId);
    }

    @Patch('users/:userId/deactivate')
    deactivateUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.setUserActive(userId, false);
    }

    @Patch('users/:userId/activate')
    activateUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.setUserActive(userId, true);
    }

    @Patch('users/:userId/role')
    updateUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('role') role: string,
    ) {
    if (!['user', 'agent', 'admin'].includes(role)) {
        throw new BadRequestException('Role must be user, agent, or admin');
    }

    return this.adminService.updateUserRole(userId, role as 'user' | 'agent' | 'admin');
    }

    @Get('tickets')
    getTickets() {
    return this.adminService.getTickets();
    }

    @Patch('tickets/:ticketId/assign')
    assignTicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body('agentId', ParseIntPipe) agentId: number,
    ) {
    return this.adminService.assignTicket(ticketId, agentId);
    }

    @Patch('tickets/:ticketId/status')
    updateTicketStatus(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body('status') status: string,
    @Body('adminUserId', ParseIntPipe) adminUserId: number,
    ) {
    if (!['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'].includes(status)) {
        throw new BadRequestException(
        'Status must be OPEN, IN_PROGRESS, WAITING_ON_CUSTOMER, RESOLVED, or CLOSED',
        );
    }

    return this.adminService.updateTicketStatus(
        ticketId,
        status as 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'RESOLVED' | 'CLOSED',
        adminUserId,
    );
    }
}