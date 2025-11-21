import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subgroup } from './entities/subgroup.entity';
import { SubgroupsController } from './subgroups.controller';
import { SubgroupsService } from './subgroups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subgroup])],
  controllers: [SubgroupsController],
  providers: [SubgroupsService],
  exports: [SubgroupsService],
})
export class SubgroupsModule {}
