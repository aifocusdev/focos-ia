import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum N8NLogType {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND',
}

export enum N8NLogStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}

@Entity('n8n_log')
@Index('IDX_n8n_log_message_id', ['message_id'])
@Index('IDX_n8n_log_user_id', ['user_id'])
@Index('IDX_n8n_log_type', ['log_type'])
@Index('IDX_n8n_log_status', ['status'])
@Index('IDX_n8n_log_created_at', ['created_at'])
export class N8NLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  message_id: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_id: string | null;

  @Column({
    type: 'enum',
    enum: N8NLogType,
  })
  log_type: N8NLogType;

  @Column({ type: 'json' })
  payload: any;

  @Column({ type: 'varchar', length: 500, nullable: true })
  endpoint: string | null;

  @Column({
    type: 'enum',
    enum: N8NLogStatus,
    default: N8NLogStatus.PENDING,
  })
  status: N8NLogStatus;

  @Column({ type: 'json', nullable: true })
  response_data: any;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @Column({ type: 'integer', nullable: true })
  http_status: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
