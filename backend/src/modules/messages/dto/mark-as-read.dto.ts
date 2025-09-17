import { IsArray, IsInt } from 'class-validator';

export class MarkAsReadDto {
  @IsArray()
  @IsInt({ each: true })
  message_ids: number[];
}
