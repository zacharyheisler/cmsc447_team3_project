import { IsInt, IsOptional } from 'class-validator';

export class AssignTicketDto {
  @IsOptional()
  @IsInt()
  agentId: number | null;
}