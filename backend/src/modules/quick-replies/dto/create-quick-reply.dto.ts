import { IsString, Length, Matches } from 'class-validator';

export class CreateQuickReplyDto {
  @IsString()
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  title: string;

  @IsString()
  @Length(2, 32, { message: 'Shortcut must be between 2 and 32 characters' })
  @Matches(/^\//, { message: 'Shortcut must start with "/"' })
  shortcut: string;

  @IsString()
  @Length(1, 5000, { message: 'Body must be between 1 and 5000 characters' })
  body: string;
}
