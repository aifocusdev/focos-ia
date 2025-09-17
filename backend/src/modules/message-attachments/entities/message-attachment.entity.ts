import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from '../../messages/entities/message.entity';
import { AttachmentKind } from '../../../common/enums';

@Entity('message_attachment')
export class MessageAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  message_id: number;

  @Column({
    type: 'enum',
    enum: AttachmentKind,
  })
  kind: AttachmentKind;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 50 })
  mime_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'integer', nullable: true })
  size: number | null;

  @Column({ type: 'integer', nullable: true })
  file_size: number | null;

  @Column({ type: 'integer', nullable: true })
  duration_ms: number | null;

  @Column({ type: 'integer', nullable: true })
  width: number | null;

  @Column({ type: 'integer', nullable: true })
  height: number | null;

  @Column({ type: 'text', nullable: true })
  thumbnail_url: string | null;

  @Column({ type: 'text', nullable: true })
  preview_url: string | null;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;
}
