import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class AddTagsToContactDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  tag_ids: number[];
}
