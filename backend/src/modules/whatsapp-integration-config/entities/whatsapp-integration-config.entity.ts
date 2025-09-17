import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('whatsapp_integration_config')
export class WhatsappIntegrationConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @Exclude()
  access_token: string;

  @Column({ type: 'varchar', length: 50 })
  phone_number_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  business_account_id?: string;

  @Column({ type: 'varchar', length: 10, default: 'v16.0' })
  api_version: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
