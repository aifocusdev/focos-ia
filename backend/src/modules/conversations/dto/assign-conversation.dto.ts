import { IsInt, IsOptional } from 'class-validator';

export class AssignConversationDto {
  @IsOptional()
  @IsInt()
  assigned_user?: number;
}
