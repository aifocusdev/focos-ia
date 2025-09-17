import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
  Index,
} from 'typeorm';
import { Contact } from '../../contacts/entities/contact.entity';
import { WhatsappIntegrationConfig } from '../../whatsapp-integration-config/entities/whatsapp-integration-config.entity';
import { User } from '../../users/entities/user.entity';
import { Bot } from '../../bots/entities/bot.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('conversation')
@Check(
  `(
    CASE WHEN assigned_user IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN assigned_bot IS NOT NULL THEN 1 ELSE 0 END
  ) <= 1`,
)
@Index('IDX_conversation_assigned_user', ['assigned_user'])
@Index('IDX_conversation_contact_id', ['contact_id'])
@Index('IDX_conversation_integration_id', ['integration_id'])
@Index('IDX_conversation_assigned_bot', ['assigned_bot'])
@Index('IDX_conversation_updated_at', ['updated_at'])
@Index('IDX_conversation_last_activity_at', ['last_activity_at'])
@Index('IDX_conversation_last_contact_message_at', ['last_contact_message_at'])
@Index('IDX_conversation_read_status', ['read'])
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  contact_id: number;

  @Column({ type: 'integer' })
  integration_id: number;

  @Column({ type: 'integer', nullable: true })
  assigned_user: number | null;

  @Column({ type: 'integer', nullable: true })
  assigned_bot: number | null;

  @Column({ type: 'integer', default: 0 })
  unread_count: number;

  @Column({ type: 'boolean', default: true })
  read: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  last_activity_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  last_contact_message_at: Date | null;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => WhatsappIntegrationConfig, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'integration_id' })
  integration: WhatsappIntegrationConfig;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_user' })
  user: User;

  @ManyToOne(() => Bot, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_bot' })
  bot: Bot;

  // Virtual property for last message (populated via query)
  last_message?: Message;
}
