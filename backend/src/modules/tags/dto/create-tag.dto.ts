import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^#([0-9A-F]{3}){1,2}$/i, {
    message: 'Color must be a valid hex color code (e.g., #FF5733 or #FFF)',
  })
  color?: string;
}
