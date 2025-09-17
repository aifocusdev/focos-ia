import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class RemoveTagsFromContactDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  tag_ids: number[];
}
