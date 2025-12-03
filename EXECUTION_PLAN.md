# 🚀 Plano de Execução - ResearchQuest

**Criado em:** 03/12/2025  
**Status:** Aguardando início

---

## 📋 RESUMO EXECUTIVO

**Tempo Total Estimado:** ~120-150 horas  
**Etapas Principais:** 8 fases  
**Modelo de Execução:** Incremental com commits frequentes

---

## 🎯 FASE 1: AUTENTICAÇÃO COMPLETA
**Tempo Estimado:** 8-10 horas  
**Prioridade:** CRÍTICA

### 1.1 Implementar SignUp Completo (3h)
- [ ] Validações de dados (email único, senha forte)
- [ ] Hash de senha com bcrypt (salt rounds = 10)
- [ ] Criar User + Researcher em transação
- [ ] Criar notificação para coordenadores
- [ ] Tratamento de erros
- [ ] **Commit:** `feat(auth): implement complete signup with validations`

### 1.2 Implementar SignIn Completo (2h)
- [ ] Validação de credenciais
- [ ] Geração de JWT token (access + refresh)
- [ ] Retornar dados do usuário
- [ ] **Commit:** `feat(auth): implement signin with JWT tokens`

### 1.3 Sistema de Autorização (3h)
- [ ] Criar decorator @Roles()
- [ ] Criar RolesGuard com hierarquia
- [ ] Criar decorator @CurrentUser()
- [ ] Criar decorator @RequireInstitution()
- [ ] **Commit:** `feat(auth): add role-based authorization system`

### 1.4 Testes de Autenticação (2h)
- [ ] Testes unitários AuthService
- [ ] Testes e2e signup/signin
- [ ] Testes de guards e decorators
- [ ] **Commit:** `test(auth): add unit and e2e tests`

**✅ Checkpoint 1:** Sistema de autenticação funcional

---

## 🎯 FASE 2: MÓDULO USERS COMPLETO
**Tempo Estimado:** 5-6 horas  
**Prioridade:** CRÍTICA

### 2.1 Implementar CRUD Users (3h)
- [ ] GET /users (listar - filtros, paginação)
- [ ] GET /users/:id (buscar por ID)
- [ ] GET /users/me (perfil logado)
- [ ] PATCH /users/:id (atualizar perfil)
- [ ] PATCH /users/change-password (alterar senha)
- [ ] DELETE /users/:id (soft delete)
- [ ] **Commit:** `feat(users): implement complete CRUD operations`

### 2.2 DTOs e Validações (1h)
- [ ] UpdateProfileDto
- [ ] ChangePasswordDto
- [ ] Validações com class-validator
- [ ] **Commit:** `feat(users): add DTOs and validations`

### 2.3 Testes Users (2h)
- [ ] Testes unitários UsersService
- [ ] Testes e2e endpoints
- [ ] **Commit:** `test(users): add unit and e2e tests`

**✅ Checkpoint 2:** CRUD de usuários funcional

---

## 🎯 FASE 3: MÓDULO INSTITUTIONS
**Tempo Estimado:** 6-7 horas  
**Prioridade:** ALTA

### 3.1 Criar Controller e Service (1h)
- [ ] InstitutionsController
- [ ] InstitutionsService
- [ ] **Commit:** `feat(institutions): create controller and service`

### 3.2 Implementar CRUD (3h)
- [ ] POST /institutions (criar - coordenador)
- [ ] GET /institutions (listar + filtros)
- [ ] GET /institutions/:id
- [ ] PATCH /institutions/:id (atualizar)
- [ ] POST /institutions/:id/coordinator (atribuir)
- [ ] DELETE /institutions/:id (soft delete)
- [ ] **Commit:** `feat(institutions): implement CRUD operations`

### 3.3 DTOs e Validações (1h)
- [ ] CreateInstitutionDto (validar CNPJ)
- [ ] UpdateInstitutionDto
- [ ] AssignCoordinatorDto
- [ ] **Commit:** `feat(institutions): add DTOs and CNPJ validation`

### 3.4 Testes (2h)
- [ ] Testes unitários
- [ ] Testes e2e
- [ ] **Commit:** `test(institutions): add comprehensive tests`

**✅ Checkpoint 3:** Gestão de instituições funcional

---

## 🎯 FASE 4: MÓDULO PROJECTS
**Tempo Estimado:** 8-10 horas  
**Prioridade:** ALTA

### 4.1 Criar Controller e Service (1h)
- [ ] ProjectsController
- [ ] ProjectsService
- [ ] **Commit:** `feat(projects): create controller and service`

### 4.2 Implementar CRUD (4h)
- [ ] POST /projects (criar - coordenador instituição)
- [ ] GET /projects (listar + filtros complexos)
- [ ] GET /projects/:id (com relacionamentos)
- [ ] PATCH /projects/:id
- [ ] DELETE /projects/:id (soft delete)
- [ ] **Commit:** `feat(projects): implement CRUD operations`

### 4.3 Gerenciamento de Coordenadores (2h)
- [ ] POST /projects/:id/coordinators
- [ ] DELETE /projects/:id/coordinators/:userId
- [ ] GET /projects/:id/coordinators
- [ ] Validações de permissão
- [ ] **Commit:** `feat(projects): add coordinator management`

### 4.4 DTOs e Validações (1h)
- [ ] CreateProjectDto (CEP, status, área)
- [ ] UpdateProjectDto
- [ ] AddCoordinatorDto
- [ ] **Commit:** `feat(projects): add DTOs and validations`

### 4.5 Testes (2h)
- [ ] Testes unitários
- [ ] Testes e2e
- [ ] **Commit:** `test(projects): add comprehensive tests`

**✅ Checkpoint 4:** Gestão de projetos funcional

---

## 🎯 FASE 5: MÓDULO RESEARCH GROUPS
**Tempo Estimado:** 7-8 horas  
**Prioridade:** ALTA

### 5.1 Criar Controller e Service (1h)
- [ ] ResearchGroupsController
- [ ] ResearchGroupsService
- [ ] **Commit:** `feat(research-groups): create controller and service`

### 5.2 Implementar CRUD (3h)
- [ ] POST /research-groups (requer aprovação)
- [ ] GET /research-groups (filtros)
- [ ] GET /research-groups/:id
- [ ] PATCH /research-groups/:id
- [ ] DELETE /research-groups/:id
- [ ] **Commit:** `feat(research-groups): implement CRUD operations`

### 5.3 Gerenciamento de Membros (2h)
- [ ] POST /research-groups/:id/members
- [ ] DELETE /research-groups/:id/members/:userId
- [ ] GET /research-groups/:id/members
- [ ] **Commit:** `feat(research-groups): add member management`

### 5.4 DTOs e Testes (2h)
- [ ] DTOs completos
- [ ] Testes unitários e e2e
- [ ] **Commit:** `feat(research-groups): add DTOs and tests`

**✅ Checkpoint 5:** Gestão de grupos de pesquisa funcional

---

## 🎯 FASE 6: MÓDULOS FIELD SURVEYS + QUESTIONNAIRES + QUESTIONS
**Tempo Estimado:** 12-15 horas  
**Prioridade:** MÉDIA

### 6.1 Field Surveys (4h)
- [ ] Controller e Service
- [ ] CRUD completo
- [ ] Gerenciamento de participantes
- [ ] DTOs e validações
- [ ] Testes
- [ ] **Commit:** `feat(field-surveys): implement complete module`

### 6.2 Questionnaires (4h)
- [ ] Controller e Service
- [ ] CRUD completo
- [ ] Associação com questões
- [ ] DTOs e validações
- [ ] Testes
- [ ] **Commit:** `feat(questionnaires): implement complete module`

### 6.3 Questions (5h)
- [ ] Controller e Service
- [ ] CRUD completo
- [ ] Sistema de versionamento
- [ ] DTOs e validações (tipos de questão)
- [ ] Testes
- [ ] **Commit:** `feat(questions): implement complete module with versioning`

### 6.4 Integração (2h)
- [ ] Testar fluxo completo
- [ ] Ajustes e correções
- [ ] **Commit:** `feat: integrate surveys, questionnaires and questions`

**✅ Checkpoint 6:** Módulos de pesquisa funcionais

---

## 🎯 FASE 7: SISTEMA DE APROVAÇÕES
**Tempo Estimado:** 10-12 horas  
**Prioridade:** ALTA

### 7.1 Implementar Controller e Service (2h)
- [ ] ApprovalsController
- [ ] ApprovalsService
- [ ] **Commit:** `feat(approvals): create controller and service`

### 7.2 Endpoints de Aprovação (3h)
- [ ] GET /approvals (pendentes)
- [ ] GET /approvals/:id
- [ ] POST /approvals/:id/approve
- [ ] POST /approvals/:id/reject
- [ ] GET /approvals/my-requests
- [ ] **Commit:** `feat(approvals): implement approval endpoints`

### 7.3 Fluxos de Aprovação (4h)
- [ ] Aprovação de cadastro de usuário
- [ ] Aprovação de alteração de questão
- [ ] Aprovação de criação de grupo
- [ ] Aprovação de criação de pesquisa de campo
- [ ] Notificações automáticas
- [ ] **Commit:** `feat(approvals): implement approval workflows`

### 7.4 DTOs e Testes (3h)
- [ ] DTOs completos
- [ ] Testes de fluxos
- [ ] **Commit:** `feat(approvals): add DTOs and comprehensive tests`

**✅ Checkpoint 7:** Sistema de aprovações funcional

---

## 🎯 FASE 8: SISTEMA DE NOTIFICAÇÕES
**Tempo Estimado:** 12-15 horas  
**Prioridade:** ALTA

### 8.1 Configurar Bull/BullMQ (3h)
- [ ] Instalar dependências (bull, @nestjs/bull)
- [ ] Configurar Redis
- [ ] Criar módulo de filas
- [ ] Configurar processadores
- [ ] **Commit:** `feat(notifications): setup bull queues with redis`

### 8.2 Implementar Controller e Service (2h)
- [ ] NotificationsController
- [ ] NotificationsService
- [ ] **Commit:** `feat(notifications): create controller and service`

### 8.3 Endpoints de Notificações (2h)
- [ ] GET /notifications
- [ ] GET /notifications/unread
- [ ] PATCH /notifications/:id/read
- [ ] PATCH /notifications/read-all
- [ ] DELETE /notifications/:id
- [ ] **Commit:** `feat(notifications): implement notification endpoints`

### 8.4 Templates e Processadores (4h)
- [ ] Template de cadastro
- [ ] Template de aprovação/rejeição
- [ ] Template de alteração de questão
- [ ] Template de convite
- [ ] Processadores de e-mail
- [ ] **Commit:** `feat(notifications): add email templates and processors`

### 8.5 Integração e Testes (3h)
- [ ] Integrar com sistema de aprovações
- [ ] Testes de filas
- [ ] Testes de envio
- [ ] **Commit:** `feat(notifications): integrate with approvals and add tests`

**✅ Checkpoint 8:** Sistema de notificações funcional

---

## 🎯 FASE 9: BUSCA POR SIMILARIDADE (OPCIONAL)
**Tempo Estimado:** 15-20 horas  
**Prioridade:** MÉDIA-BAIXA

### 9.1 Configurar pgVector (3h)
- [ ] Habilitar extensão no PostgreSQL
- [ ] Atualizar schema Prisma
- [ ] Criar índices vetoriais
- [ ] **Commit:** `feat(db): add pgvector support for similarity search`

### 9.2 Serviço de Embeddings (5h)
- [ ] Escolher provedor (OpenAI/local)
- [ ] Criar EmbeddingsService
- [ ] Implementar cache
- [ ] Rate limiting
- [ ] **Commit:** `feat(embeddings): implement embeddings service`

### 9.3 Busca por Similaridade (4h)
- [ ] POST /questions/search-similar
- [ ] Filtros (threshold, limit, scope)
- [ ] **Commit:** `feat(questions): add similarity search endpoint`

### 9.4 Algoritmo de Mesclagem (5h)
- [ ] Implementar mesclagem de questões
- [ ] Preservar histórico
- [ ] Notificar autores
- [ ] **Commit:** `feat(questions): add merge algorithm`

### 9.5 Testes (3h)
- [ ] Testes de embeddings
- [ ] Testes de busca
- [ ] Benchmark
- [ ] **Commit:** `test(similarity): add comprehensive tests`

**✅ Checkpoint 9:** Busca por similaridade funcional

---

## 🎯 FASE 10: DOCUMENTAÇÃO E POLISH
**Tempo Estimado:** 8-10 horas  
**Prioridade:** MÉDIA

### 10.1 Swagger/OpenAPI (3h)
- [ ] Configurar Swagger
- [ ] Documentar todos os endpoints
- [ ] Adicionar exemplos
- [ ] **Commit:** `docs: add swagger/openapi documentation`

### 10.2 Seeds e Dados de Teste (2h)
- [ ] Criar script de seed
- [ ] Dados de exemplo
- [ ] **Commit:** `feat(db): add seed data for development`

### 10.3 Melhorias de Código (3h)
- [ ] Refatoração
- [ ] Otimizações
- [ ] Code review
- [ ] **Commit:** `refactor: code improvements and optimizations`

### 10.4 README e Documentação (2h)
- [ ] Atualizar README
- [ ] Guia de instalação
- [ ] Guia de uso da API
- [ ] **Commit:** `docs: update readme and usage guide`

**✅ Checkpoint 10:** Projeto documentado e polido

---

## 📊 RESUMO DE TEMPO POR PRIORIDADE

| Prioridade | Fases | Tempo Estimado |
|------------|-------|----------------|
| CRÍTICA | Fases 1-2 | 13-16h |
| ALTA | Fases 3-5, 7-8 | 55-64h |
| MÉDIA | Fases 6, 10 | 20-25h |
| BAIXA | Fase 9 | 15-20h |

**Total Mínimo (sem Fase 9):** 88-105 horas  
**Total Completo:** 103-125 horas

---

## 🎯 ESTRATÉGIA DE EXECUÇÃO

### Modelo Incremental:
1. Completar cada checkpoint antes de prosseguir
2. Fazer commit após cada subtarefa
3. Testar funcionalidade antes de avançar
4. Pausar entre fases para validação

### Pontos de Pausa Recomendados:
- ✋ **Após Fase 2:** Sistema de autenticação + users funcional
- ✋ **Após Fase 5:** Todos os módulos core funcionais
- ✋ **Após Fase 8:** Sistema completo sem similaridade
- ✋ **Após Fase 9:** Sistema completo
- ✋ **Após Fase 10:** Projeto finalizado

---

## 🚀 COMANDOS ÚTEIS

```bash
# Antes de cada fase
git status
git pull

# Após cada commit
git add .
git commit -m "mensagem do commit"
git push origin main

# Testar funcionalidade
pnpm --filter api test
pnpm --filter api dev

# Verificar banco
pnpm --filter api prisma studio
```

---

## ✅ CHECKLIST DE INÍCIO

Antes de começar a Fase 1, verificar:
- [ ] Banco de dados acessível (172.21.31.152:5432)
- [ ] Prisma Client gerado
- [ ] Dependências instaladas
- [ ] .env configurado
- [ ] Git configurado
- [ ] Workspace limpo

---

**Status Atual:** ✅ Pronto para iniciar  
**Próxima Ação:** Aguardando autorização para Fase 1
