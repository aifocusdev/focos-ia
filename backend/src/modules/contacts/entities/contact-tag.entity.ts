import {
  Entity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';
import { Contact } from './contact.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('contact_tag')
@Index('IDX_contact_tag_tag_id', ['tag_id'])
export class ContactTag {
  @PrimaryColumn({ type: 'integer' })
  contact_id: number;

  @PrimaryColumn({ type: 'integer' })
  tag_id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => Tag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
