import { IsInt, IsOptional, ValidateIf } from 'class-validator';

export class CreateConversationDto {
  @IsInt()
  contact_id: number;

  @IsInt()
  integration_id: number;

  @IsOptional()
  @IsInt()
  @ValidateIf((obj) => !obj.assigned_bot)
  assigned_user?: number;

  @IsOptional()
  @IsInt()
  @ValidateIf((obj) => !obj.assigned_user)
  assigned_bot?: number;
}
