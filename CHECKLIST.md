# ResearchQuest - Checklist de Desenvolvimento

**Última atualização:** 03/12/2025  
**Status Geral:** Fase de Estruturação Inicial

---

## 📋 ÍNDICE DE FASES

1. [Configuração Inicial](#fase-1-configuração-inicial)
2. [Modelagem de Dados](#fase-2-modelagem-de-dados)
3. [Autenticação e Autorização](#fase-3-autenticação-e-autorização)
4. [Módulos Core](#fase-4-módulos-core)
5. [Sistema de Aprovações](#fase-5-sistema-de-aprovações)
6. [Sistema de Notificações](#fase-6-sistema-de-notificações)
7. [Busca por Similaridade](#fase-7-busca-por-similaridade)
8. [Auditoria e Logs](#fase-8-auditoria-e-logs)
9. [Testes](#fase-9-testes)
10. [Deploy e Produção](#fase-10-deploy-e-produção)

---

## FASE 1: Configuração Inicial

### 1.1 Ambiente e Ferramentas
- [x] Criar estrutura de monorepo (pnpm workspace)
- [x] Configurar Turborepo
- [x] Configurar Docker Compose (PostgreSQL + Redis + pgVector)
- [x] **Verificar instalação de ferramentas necessárias**
  - [x] Node.js >= 20.0.0 (v24.11.1 instalado)
  - [x] pnpm >= 10.0.0 (10.24.0 instalado)
  - [x] Docker (v28.2.2 instalado no WSL Ubuntu)
  - [x] Git (v2.51.2 instalado)
- [ ] **Conectar ao banco de dados externo**
  - Host: 172.21.31.152
  - Port: 5432
  - User: pmfdtidev
  - Password: pmfdtipwd
  - Database: ricardodavid
- [ ] Instalar extensões VS Code recomendadas
  - [ ] Prisma
  - [ ] ESLint
  - [ ] Prettier
  - [ ] Docker
  - [ ] GitLens

### 1.2 Configuração de Projeto
- [x] Criar estrutura de apps/api (NestJS)
- [ ] Criar estrutura de apps/web (Next.js)
- [x] Configurar variáveis de ambiente (.env)
  - [x] Arquivo .env na raiz configurado
  - [x] Arquivo .env em apps/api/ configurado
  - [x] Conexão com banco externo testada (172.21.31.152:5432)
  - [x] Database ricardodavid verificado e acessível
- [ ] Configurar ESLint e Prettier
- [ ] Configurar Husky para pre-commit hooks
- [ ] Configurar CommitLint

### 1.3 Dependências Backend
- [x] Instalar dependências NestJS core
- [x] Instalar Prisma ORM (v5.22.0)
- [x] Instalar Passport (JWT, Local Strategy)
- [x] Instalar Bull/BullMQ para filas (v5.65.1)
- [x] Instalar bcrypt para hash de senhas (v5.1.1)
- [x] Instalar class-validator e class-transformer
- [x] Instalar @nestjs/swagger para documentação API
- [x] Gerar Prisma Client

### 1.4 Dependências Frontend
- [ ] Instalar Next.js
- [ ] Instalar React Query/TanStack Query
- [ ] Instalar Tailwind CSS
- [ ] Instalar shadcn/ui
- [ ] Instalar React Hook Form + Zod
- [ ] Instalar Axios/Fetch client

---

## FASE 2: Modelagem de Dados

### 2.1 Schema Prisma - Estrutura Base
- [x] Definir enums (UserRole, InstitutionType, etc.)
- [x] Criar modelo User
- [x] Criar modelo Researcher
- [x] Criar modelo Institution
- [x] Criar modelo Project
- [x] Criar modelo ResearchGroup
- [x] Criar modelo FieldSurvey
- [x] Criar modelo Questionnaire
- [x] Criar modelo Question

### 2.2 Schema Prisma - Relacionamentos
- [x] Relações User <-> Researcher
- [x] Relações Researcher <-> Institution
- [x] Relações Institution <-> Project
- [x] Relações Project <-> ResearchGroup
- [x] Relações ResearchGroup <-> FieldSurvey
- [x] Relações FieldSurvey <-> Questionnaire
- [x] Relações Questionnaire <-> Question
- [x] Tabelas de junção para muitos-para-muitos

### 2.3 Schema Prisma - Recursos Avançados
- [x] Modelo ApprovalRequest (sistema de aprovações)
- [x] Modelo Notification (notificações)
- [x] Modelo AuditLog (auditoria)
- [x] Modelo QuestionVersion (versionamento de questões)
- [ ] **Adicionar suporte pgVector para similaridade**
  - [ ] Habilitar extensão pgvector no PostgreSQL
  - [ ] Adicionar campo embedding no modelo Question
  - [ ] Criar índices para busca vetorial

### 2.4 Migrations
- [ ] **Executar primeira migration**
  - [ ] `npx prisma migrate dev --name init`
- [ ] Criar arquivo init.sql com extensões
  - [ ] CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
  - [ ] CREATE EXTENSION IF NOT EXISTS "pgvector"
- [ ] Validar schema no banco de dados
- [ ] Criar seeds para dados iniciais

---

## FASE 3: Autenticação e Autorização

### 3.1 Autenticação JWT
- [x] Criar módulo Auth
- [x] Criar AuthController básico
- [x] Criar AuthService básico
- [ ] **Implementar SignUp completo**
  - [ ] Validação de dados
  - [ ] Hash de senha com bcrypt
  - [ ] Criação de User + Researcher
  - [ ] Envio de notificação para coordenadores
- [ ] **Implementar SignIn completo**
  - [ ] Validação de credenciais
  - [ ] Geração de JWT token
  - [ ] Refresh token strategy
- [x] Criar JWT Strategy
- [x] Criar Local Strategy
- [x] Criar JWT Guard
- [x] Criar Local Guard

### 3.2 Autorização Baseada em Roles
- [ ] Criar decorator @Roles()
- [ ] Criar RolesGuard
- [ ] Implementar verificação de permissões hierárquicas
  - [ ] COORDENADOR_PROJETO pode criar projetos
  - [ ] COORDENADOR_GRUPO pode criar grupos
  - [ ] Qualquer pesquisador pode criar questões
- [ ] Criar decorator @CurrentUser()
- [ ] Criar decorator @RequireInstitution()

### 3.3 Testes de Autenticação
- [ ] Testes unitários AuthService
- [ ] Testes e2e para /auth/signup
- [ ] Testes e2e para /auth/signin
- [ ] Testes de autorização por role

---

## FASE 4: Módulos Core

### 4.1 Módulo Users
- [x] Criar UsersModule
- [x] Criar UsersController
- [x] Criar UsersService
- [ ] **Implementar endpoints CRUD**
  - [ ] GET /users (listar - admin)
  - [ ] GET /users/:id (buscar por ID)
  - [ ] GET /users/me (perfil do usuário logado)
  - [ ] PATCH /users/:id (atualizar)
  - [ ] DELETE /users/:id (soft delete)
- [ ] Criar DTOs completos
  - [x] CreateResearcherDto (básico)
  - [x] UpdateResearcherDto (básico)
  - [ ] UpdateProfileDto
  - [ ] ChangePasswordDto
- [ ] Implementar validações
- [ ] Testes unitários e e2e

### 4.2 Módulo Institutions
- [x] Criar InstitutionsModule
- [ ] Criar InstitutionsController
- [ ] Criar InstitutionsService
- [ ] **Implementar endpoints CRUD**
  - [ ] POST /institutions (criar - coordenador)
  - [ ] GET /institutions (listar)
  - [ ] GET /institutions/:id (buscar por ID)
  - [ ] PATCH /institutions/:id (atualizar - coordenador)
  - [ ] DELETE /institutions/:id (soft delete)
- [ ] Criar DTOs
  - [ ] CreateInstitutionDto (CNPJ obrigatório)
  - [ ] UpdateInstitutionDto
  - [ ] AssignCoordinatorDto
- [ ] Validações (CNPJ válido)
- [ ] Testes

### 4.3 Módulo Projects
- [x] Criar ProjectsModule
- [ ] Criar ProjectsController
- [ ] Criar ProjectsService
- [ ] **Implementar endpoints CRUD**
  - [ ] POST /projects (criar - coordenador instituição)
  - [ ] GET /projects (listar com filtros)
  - [ ] GET /projects/:id (buscar por ID)
  - [ ] PATCH /projects/:id (atualizar)
  - [ ] DELETE /projects/:id (soft delete)
  - [ ] POST /projects/:id/coordinators (adicionar coordenador)
  - [ ] DELETE /projects/:id/coordinators/:userId (remover)
- [ ] Criar DTOs
  - [ ] CreateProjectDto (incluir CEP, status, área)
  - [ ] UpdateProjectDto
  - [ ] AddCoordinatorDto
- [ ] Validações de permissão
- [ ] Testes

### 4.4 Módulo Research Groups
- [x] Criar ResearchGroupsModule
- [ ] Criar ResearchGroupsController
- [ ] Criar ResearchGroupsService
- [ ] **Implementar endpoints CRUD**
  - [ ] POST /research-groups (criar - coordenador projeto)
  - [ ] GET /research-groups (listar)
  - [ ] GET /research-groups/:id (buscar por ID)
  - [ ] PATCH /research-groups/:id (atualizar)
  - [ ] DELETE /research-groups/:id (soft delete)
  - [ ] POST /research-groups/:id/members (adicionar membro)
  - [ ] DELETE /research-groups/:id/members/:userId (remover)
- [ ] Criar DTOs
- [ ] Sistema de aprovação para criação de grupos
- [ ] Testes

### 4.5 Módulo Field Surveys
- [x] Criar FieldSurveysModule
- [ ] Criar FieldSurveysController
- [ ] Criar FieldSurveysService
- [ ] **Implementar endpoints CRUD**
  - [ ] POST /field-surveys (criar - membro do grupo)
  - [ ] GET /field-surveys (listar)
  - [ ] GET /field-surveys/:id (buscar por ID)
  - [ ] PATCH /field-surveys/:id (atualizar)
  - [ ] DELETE /field-surveys/:id (soft delete)
  - [ ] POST /field-surveys/:id/participants (adicionar participante)
- [ ] Criar DTOs
- [ ] Sistema de aprovação por coordenador de grupo
- [ ] Testes

### 4.6 Módulo Questionnaires
- [x] Criar QuestionnairesModule
- [ ] Criar QuestionnairesController
- [ ] Criar QuestionnairesService
- [ ] **Implementar endpoints CRUD**
  - [ ] POST /questionnaires (criar)
  - [ ] GET /questionnaires (listar)
  - [ ] GET /questionnaires/:id (buscar por ID)
  - [ ] PATCH /questionnaires/:id (atualizar)
  - [ ] DELETE /questionnaires/:id (soft delete)
  - [ ] POST /questionnaires/:id/questions (adicionar questão)
  - [ ] DELETE /questionnaires/:id/questions/:questionId (remover)
- [ ] Criar DTOs
- [ ] Suporte para diferentes tipos (impresso, online, etc.)
- [ ] Testes

### 4.7 Módulo Questions
- [x] Criar QuestionsModule
- [ ] Criar QuestionsController
- [ ] Criar QuestionsService
- [ ] **Implementar endpoints CRUD**
  - [ ] POST /questions (criar - qualquer pesquisador)
  - [ ] GET /questions (listar com filtros)
  - [ ] GET /questions/:id (buscar por ID)
  - [ ] PATCH /questions/:id (atualizar - requer aprovação)
  - [ ] DELETE /questions/:id (soft delete)
  - [ ] POST /questions/search-similar (busca por similaridade)
- [ ] Criar DTOs
  - [ ] CreateQuestionDto (tipos, validações, categorização)
  - [ ] UpdateQuestionDto
  - [ ] SearchSimilarDto (threshold, limit, scope)
- [ ] Implementar versionamento
- [ ] Testes

---

## FASE 5: Sistema de Aprovações

### 5.1 Módulo Approvals
- [x] Criar ApprovalsModule
- [ ] Criar ApprovalsController
- [ ] Criar ApprovalsService
- [ ] **Implementar endpoints**
  - [ ] GET /approvals (minhas aprovações pendentes)
  - [ ] GET /approvals/:id (detalhes)
  - [ ] POST /approvals/:id/approve (aprovar)
  - [ ] POST /approvals/:id/reject (rejeitar)
  - [ ] GET /approvals/my-requests (minhas solicitações)
- [ ] Criar DTOs
  - [ ] ApproveDto
  - [ ] RejectDto (com motivo)

### 5.2 Fluxos de Aprovação
- [ ] **Aprovação de cadastro de usuário**
  - [ ] Notificar coordenador de projeto
  - [ ] Notificar coordenador de grupo
  - [ ] Implementar lógica de aprovação
- [ ] **Aprovação de alteração de questão**
  - [ ] Notificar autor original
  - [ ] Implementar lógica de mesclagem
- [ ] **Aprovação de criação de grupo**
  - [ ] Notificar coordenador de projeto
- [ ] **Aprovação de criação de pesquisa de campo**
  - [ ] Notificar coordenador de grupo

### 5.3 Testes de Aprovação
- [ ] Testes unitários ApprovalService
- [ ] Testes e2e fluxos de aprovação
- [ ] Testes de permissões

---

## FASE 6: Sistema de Notificações

### 6.1 Módulo Notifications
- [x] Criar NotificationsModule
- [ ] Criar NotificationsController
- [ ] Criar NotificationsService
- [ ] **Implementar endpoints**
  - [ ] GET /notifications (minhas notificações)
  - [ ] GET /notifications/unread (não lidas)
  - [ ] PATCH /notifications/:id/read (marcar como lida)
  - [ ] PATCH /notifications/read-all (marcar todas)
  - [ ] DELETE /notifications/:id (excluir)

### 6.2 Sistema de Filas (Bull/BullMQ)
- [ ] Configurar Bull com Redis
- [ ] Criar fila para e-mails
- [ ] Criar fila para SMS (opcional)
- [ ] Criar processor para e-mails
- [ ] Criar processor para SMS
- [ ] Implementar retry logic
- [ ] Dashboard Bull Board (opcional)

### 6.3 Templates de Notificação
- [ ] Template de cadastro de usuário
- [ ] Template de aprovação/rejeição
- [ ] Template de alteração de questão
- [ ] Template de nova pesquisa de campo
- [ ] Template de convite para grupo

### 6.4 Testes
- [ ] Testes unitários NotificationService
- [ ] Testes de processamento de filas
- [ ] Testes de envio de e-mail

---

## FASE 7: Busca por Similaridade

### 7.1 Configuração pgVector
- [ ] **Habilitar extensão no PostgreSQL**
- [ ] Adicionar campo `embedding` no modelo Question
- [ ] Criar índice HNSW ou IVFFlat
- [ ] Testar queries de similaridade

### 7.2 Serviço de Embeddings
- [ ] Escolher provedor (OpenAI, Cohere, ou local)
- [ ] Criar EmbeddingsService
- [ ] Implementar geração de embeddings
- [ ] Implementar cache de embeddings
- [ ] Configurar rate limiting

### 7.3 Busca por Similaridade
- [ ] **Implementar endpoint POST /questions/search-similar**
- [ ] Parâmetros configuráveis:
  - [ ] Threshold (70%, 80%, 90%)
  - [ ] Limite de sugestões (5, 10, 20, 30)
  - [ ] Scope (local, institucional, nacional, etc.)
- [ ] Filtrar por scope
- [ ] Ordenar por similaridade
- [ ] Retornar metadados relevantes

### 7.4 Interface de Mesclagem
- [ ] Algoritmo de mesclagem de questões
- [ ] Opções: mesclar, substituir, concatenar, manter
- [ ] Preservar histórico de versões
- [ ] Notificar autores envolvidos

### 7.5 Testes
- [ ] Testes de geração de embeddings
- [ ] Testes de busca por similaridade
- [ ] Testes de mesclagem
- [ ] Benchmark de performance

---

## FASE 8: Auditoria e Logs

### 8.1 Sistema de Auditoria
- [ ] Implementar interceptor de auditoria
- [ ] Registrar todas as ações importantes
- [ ] Capturar: usuário, ação, entidade, dados antes/depois
- [ ] Implementar soft delete em todas as entidades

### 8.2 Relatórios de Auditoria
- [ ] Endpoint para histórico de entidade
- [ ] Endpoint para ações de usuário
- [ ] Filtros por data, ação, entidade
- [ ] Exportação de relatórios

### 8.3 Testes
- [ ] Testes do interceptor de auditoria
- [ ] Testes de relatórios

---

## FASE 9: Testes

### 9.1 Testes Unitários
- [ ] Configurar Jest
- [ ] Testes de serviços (>80% coverage)
- [ ] Testes de guards
- [ ] Testes de validators
- [ ] Testes de utils

### 9.2 Testes de Integração
- [ ] Configurar banco de dados de teste
- [ ] Testes de repositórios Prisma
- [ ] Testes de fluxos complexos
- [ ] Testes de transações

### 9.3 Testes E2E
- [ ] Configurar Supertest
- [ ] Testes de todos os endpoints
- [ ] Testes de autenticação
- [ ] Testes de autorização
- [ ] Testes de fluxos completos

### 9.4 Testes de Performance
- [ ] Testes de carga (Artillery ou k6)
- [ ] Benchmarks de queries
- [ ] Otimização de N+1 queries
- [ ] Análise de memória

---

## FASE 10: Deploy e Produção

### 10.1 Ambiente de Produção
- [ ] **Configurar conexão com banco externo**
  - Host: 172.21.31.152
  - Database: ricardodavid
- [ ] Configurar variáveis de ambiente de produção
- [ ] Configurar HTTPS/SSL
- [ ] Configurar CORS
- [ ] Configurar rate limiting
- [ ] Configurar helmet (security headers)

### 10.2 Docker para Produção
- [ ] Otimizar Dockerfile (multi-stage build)
- [ ] Configurar docker-compose.prod.yml
- [ ] Configurar volumes persistentes
- [ ] Configurar healthchecks
- [ ] Configurar restart policies

### 10.3 CI/CD
- [ ] Configurar GitHub Actions
- [ ] Pipeline de testes
- [ ] Pipeline de build
- [ ] Pipeline de deploy
- [ ] Configurar environments (staging, production)

### 10.4 Monitoramento
- [ ] Configurar logs estruturados
- [ ] Configurar Prometheus + Grafana
- [ ] Configurar alertas
- [ ] Configurar APM (Application Performance Monitoring)
- [ ] Configurar backup automático do banco

### 10.5 Documentação
- [ ] Documentação da API (Swagger)
- [ ] README completo
- [ ] Guia de instalação
- [ ] Guia de contribuição
- [ ] Diagramas de arquitetura
- [ ] Diagramas de fluxo

---

## 📊 PROGRESSO GERAL

### Fases Completas: 0/10 (0%)
- [ ] Fase 1: Configuração Inicial (60% completo)
- [ ] Fase 2: Modelagem de Dados (85% completo)
- [ ] Fase 3: Autenticação e Autorização (30% completo)
- [ ] Fase 4: Módulos Core (15% completo)
- [ ] Fase 5: Sistema de Aprovações (10% completo)
- [ ] Fase 6: Sistema de Notificações (10% completo)
- [ ] Fase 7: Busca por Similaridade (0% completo)
- [ ] Fase 8: Auditoria e Logs (30% completo - schema pronto)
- [ ] Fase 9: Testes (0% completo)
- [ ] Fase 10: Deploy e Produção (20% completo - Docker básico)

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

### Prioridade CRÍTICA (fazer agora):
1. **Verificar e instalar ferramentas necessárias**
2. **Configurar conexão com banco de dados externo** (172.21.31.152)
3. **Executar primeira migration do Prisma**
4. **Configurar variáveis de ambiente**
5. **Testar se a aplicação sobe corretamente**

### Prioridade ALTA (fazer em seguida):
6. Implementar SignUp e SignIn completos
7. Implementar CRUD de Users
8. Implementar CRUD de Institutions
9. Implementar sistema de aprovações básico
10. Configurar Bull para notificações

### Prioridade MÉDIA:
11. Implementar demais módulos core
12. Configurar pgVector para similaridade
13. Implementar testes unitários

### Prioridade BAIXA:
14. Frontend (Next.js)
15. Integrações externas (CEP, Google Forms)
16. Otimizações de performance

---

## 📝 NOTAS IMPORTANTES

- **Banco de dados externo:** Usar 172.21.31.152:5432 (pmfdtidev/pmfdtipwd/ricardodavid)
- **Autenticação:** JWT simplificada, sem provedores externos
- **Similaridade:** pgVector para embeddings de questões
- **Notificações:** Bull/BullMQ com Redis para processamento assíncrono
- **Testes:** Escala de complexidade gradual
- **Hierarquia de aprovações:** Implementar fluxos bem definidos

---

## 🔧 COMANDOS ÚTEIS

```bash
# Instalar dependências
pnpm install

# Gerar Prisma Client
pnpm --filter api prisma generate

# Executar migrations
pnpm --filter api prisma migrate dev

# Subir ambiente de desenvolvimento
pnpm dev

# Rodar testes
pnpm test

# Build para produção
pnpm build

# Docker
docker-compose up -d
docker-compose logs -f api
```
