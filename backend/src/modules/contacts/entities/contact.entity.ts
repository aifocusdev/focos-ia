import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Tag } from '../../tags/entities/tag.entity';
import { ContactUserAccount } from '../../contact-user-accounts/entities/contact-user-account.entity';
import { ContactType } from '../../../common/enums/contact-type.enum';

@Entity('contact')
@Index('IDX_contact_name', ['name'])
@Index('IDX_contact_created_at', ['created_at'])
@Index('IDX_contact_notes', ['notes'])
@Index('IDX_contact_accepts_remarketing', ['accepts_remarketing'])
@Index('IDX_contact_contact_type', ['contact_type'])
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  external_id: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone_number: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  accepts_remarketing: boolean;

  @Column({
    type: 'enum',
    enum: ContactType,
    default: ContactType.ADS,
  })
  contact_type: ContactType;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToMany(() => Tag, (tag) => tag.contacts)
  @JoinTable({
    name: 'contact_tag',
    joinColumn: {
      name: 'contact_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];

  @OneToMany(() => ContactUserAccount, (userAccount) => userAccount.contact)
  contactUserAccounts: ContactUserAccount[];
}
