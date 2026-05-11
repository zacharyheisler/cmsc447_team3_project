import { IsIn } from 'class-validator';

export class UpdateRoleDto {
  @IsIn(['user', 'agent', 'admin'])
  role: 'user' | 'agent' | 'admin';
}