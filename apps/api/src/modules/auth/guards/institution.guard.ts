import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { REQUIRE_INSTITUTION_KEY } from '../decorators/require-institution.decorator';

@Injectable()
export class InstitutionGuard implements CanActivate {
  private readonly logger = new Logger(InstitutionGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireInstitution = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_INSTITUTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireInstitution) {
      return true; // Se não requer instituição, permite acesso
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Buscar perfil de pesquisador do usuário
    const researcher = await this.prisma.researcher.findUnique({
      where: { userId: user.userId },
      include: {
        primaryInstitution: true,
      },
    });

    if (!researcher || !researcher.primaryInstitution) {
      this.logger.warn(
        `Acesso negado: usuário ${user.userId} não tem instituição vinculada`
      );
      throw new ForbiddenException(
        'Acesso negado. É necessário estar vinculado a uma instituição para acessar este recurso.'
      );
    }

    // Adicionar informações da instituição ao request para uso posterior
    context.switchToHttp().getRequest().institution = researcher.primaryInstitution;
    context.switchToHttp().getRequest().researcher = researcher;

    return true;
  }
}
