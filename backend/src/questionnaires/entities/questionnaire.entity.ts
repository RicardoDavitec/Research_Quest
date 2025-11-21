import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Researcher } from '../../researchers/entities/researcher.entity';
import { Question } from '../../questions/entities/question.entity';
import { Survey } from '../../surveys/entities/survey.entity';
import { Subgroup } from '../../subgroups/entities/subgroup.entity';

@Entity('questionnaires')
export class Questionnaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 200 })
  title: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  description: string;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Researcher, (researcher) => researcher.questionnaires)
  @JoinColumn({ name: 'creatorId' })
  creator: Researcher;

  @Column({ type: 'uniqueidentifier' })
  creatorId: string;

  @ManyToOne(() => Subgroup)
  @JoinColumn({ name: 'subgroupId' })
  subgroup: Subgroup;

  @Column({ type: 'uniqueidentifier' })
  subgroupId: string;

  @ManyToMany(() => Question, (question) => question.questionnaires)
  @JoinTable({
    name: 'questionnaire_questions',
    joinColumn: { name: 'questionnaireId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'questionId', referencedColumnName: 'id' },
  })
  questions: Question[];

  @OneToMany(() => Survey, (survey) => survey.questionnaire)
  surveys: Survey[];
}
