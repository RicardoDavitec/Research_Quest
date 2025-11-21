import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { Subgroup } from '../../subgroups/entities/subgroup.entity';
import { Researcher } from '../../researchers/entities/researcher.entity';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  YES_NO = 'yes_no',
  OPEN_TEXT = 'open_text',
  QUANTITATIVE = 'quantitative',
  QUALITATIVE = 'qualitative',
  SCALE = 'scale',
}

export enum QuestionVisibility {
  PRIVATE = 'private',
  SUBGROUP = 'subgroup',
  PUBLIC = 'public',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  ALL = 'all',
}

export enum EducationLevel {
  NONE = 'none',
  ELEMENTARY = 'elementary',
  HIGH_SCHOOL = 'high_school',
  UNDERGRADUATE = 'undergraduate',
  GRADUATE = 'graduate',
  POSTGRADUATE = 'postgraduate',
  ALL = 'all',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 1000 })
  text: string;

  @Column({
    type: 'nvarchar',
    length: 20,
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({
    type: 'nvarchar',
    length: 20,
    enum: QuestionVisibility,
    default: QuestionVisibility.SUBGROUP,
  })
  visibility: QuestionVisibility;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  objective: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  targetAudience: string;

  @Column({
    type: 'nvarchar',
    length: 20,
    enum: Gender,
    default: Gender.ALL,
  })
  targetGender: Gender;

  @Column({
    type: 'nvarchar',
    length: 30,
    enum: EducationLevel,
    default: EducationLevel.ALL,
  })
  targetEducationLevel: EducationLevel;

  @Column({ type: 'int', nullable: true })
  minAge: number;

  @Column({ type: 'int', nullable: true })
  maxAge: number;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  targetLocation: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  restrictions: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  researchName: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  options: string; // JSON string for multiple choice options

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  parentQuestionId: string; // For merged questions

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Researcher, (researcher) => researcher.questions)
  @JoinColumn({ name: 'authorId' })
  author: Researcher;

  @Column({ type: 'uniqueidentifier' })
  authorId: string;

  @ManyToOne(() => Subgroup, (subgroup) => subgroup.questions)
  @JoinColumn({ name: 'subgroupId' })
  subgroup: Subgroup;

  @Column({ type: 'uniqueidentifier' })
  subgroupId: string;

  @ManyToMany(() => Questionnaire, (questionnaire) => questionnaire.questions)
  questionnaires: Questionnaire[];
}
