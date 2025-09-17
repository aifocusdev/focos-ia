import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('quick_reply')
@Check(`LENGTH(title) >= 1 AND LENGTH(title) <= 100`)
@Check(`LENGTH(shortcut) >= 2 AND LENGTH(shortcut) <= 32`)
@Check(`shortcut LIKE '/%'`)
@Check(`LENGTH(body) >= 1 AND LENGTH(body) <= 5000`)
@Index('IDX_quick_reply_shortcut_unique', ['shortcut'], { unique: true })
@Index('IDX_quick_reply_title', ['title'])
export class QuickReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  shortcut: string;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
