import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Contact } from '../../contacts/entities/contact.entity';
import { Server } from '../../servers/entities/server.entity';
import { Application } from '../../applications/entities/application.entity';
import { Device } from '../../devices/entities/device.entity';

@Entity('contact_user_account')
@Index('IDX_contact_user_account_contact_id', ['contact_id'])
@Index('IDX_contact_user_account_server_id', ['server_id'])
@Index('IDX_contact_user_account_username_server', [
  'username_final',
  'server_id',
])
@Index('IDX_contact_user_account_date_exp', ['date_exp'])
@Index('IDX_contact_user_account_created_at', ['created_at'])
export class ContactUserAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  contact_id: number;

  @Column({ type: 'varchar', length: 150 })
  username_final: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password_final: string;

  @Column({ type: 'integer' })
  server_id: number;

  @Column({ type: 'integer', nullable: true })
  id_line_server: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  date_exp: Date | null;

  @Column({ type: 'integer', nullable: true })
  application_id: number | null;

  @Column({ type: 'integer', nullable: true })
  device_id: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => Server, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @ManyToOne(() => Application, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'application_id' })
  application: Application | null;

  @ManyToOne(() => Device, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'device_id' })
  device: Device | null;
}
