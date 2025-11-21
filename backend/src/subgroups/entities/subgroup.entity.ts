import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Researcher } from '../../researchers/entities/researcher.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('subgroups')
export class Subgroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Researcher, (researcher) => researcher.subgroup)
  researchers: Researcher[];

  @OneToMany(() => Question, (question) => question.subgroup)
  questions: Question[];
}
