import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Check,
  Index,
} from 'typeorm';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { User } from '../../users/entities/user.entity';
import { Bot } from '../../bots/entities/bot.entity';
import { MessageAttachment } from '../../message-attachments/entities/message-attachment.entity';
import { MessageSender } from '../../../common/enums';

@Entity('message')
@Check(
  `(sender_type != 'user' OR sender_user IS NOT NULL) AND
   (sender_type != 'bot' OR sender_bot IS NOT NULL)`,
)
@Index('IDX_message_conversation_pagination', [
  'conversation_id',
  'delivered_at',
  'id',
])
@Index('IDX_message_conversation_read_status', ['conversation_id', 'read_at'])
@Index('IDX_message_whatsapp_id', ['whatsapp_message_id'])
@Index('IDX_message_sender_type_conversation', [
  'sender_type',
  'conversation_id',
])
@Index('IDX_message_body_fulltext', ['body'])
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  conversation_id: number;

  @Column({
    type: 'enum',
    enum: MessageSender,
  })
  sender_type: MessageSender;

  @Column({ type: 'integer', nullable: true })
  sender_user: number | null;

  @Column({ type: 'integer', nullable: true })
  sender_bot: number | null;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  delivered_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  read_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  whatsapp_message_id: string;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sender_user' })
  user: User;

  @ManyToOne(() => Bot, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sender_bot' })
  bot: Bot;

  @OneToMany(() => MessageAttachment, (attachment) => attachment.message, {
    cascade: true,
  })
  attachments: MessageAttachment[];
}
