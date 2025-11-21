import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';
import { Researcher } from '../../researchers/entities/researcher.entity';

export enum ApplicationMethod {
  ONLINE = 'online',
  DIGITAL = 'digital',
  PRINTED = 'printed',
  RECORDED = 'recorded',
  FILMED = 'filmed',
  INTERVIEW = 'interview',
  PHONE = 'phone',
}

export enum SurveyStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 200 })
  title: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  description: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  objectives: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  targetAudience: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  locations: string; // JSON array of locations

  @Column({ type: 'datetime2', nullable: true })
  startDate: Date;

  @Column({ type: 'datetime2', nullable: true })
  endDate: Date;

  @Column({
    type: 'nvarchar',
    length: 20,
    enum: ApplicationMethod,
  })
  applicationMethod: ApplicationMethod;

  @Column({
    type: 'nvarchar',
    length: 20,
    enum: SurveyStatus,
    default: SurveyStatus.PLANNING,
  })
  status: SurveyStatus;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  metadata: string; // JSON for additional data

  @Column({ type: 'int', default: 0 })
  responseCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.surveys)
  @JoinColumn({ name: 'questionnaireId' })
  questionnaire: Questionnaire;

  @Column({ type: 'uniqueidentifier' })
  questionnaireId: string;

  @ManyToOne(() => Researcher, (researcher) => researcher.surveys)
  @JoinColumn({ name: 'responsibleId' })
  responsible: Researcher;

  @Column({ type: 'uniqueidentifier' })
  responsibleId: string;
}
