# 🧪 Guia Completo de Testes - ResearchQuest API

Este guia explica como testar a API ResearchQuest usando diferentes ferramentas.

## 📋 Sumário

1. [Preparação do Ambiente](#-preparação-do-ambiente)
2. [Swagger UI (Recomendado)](#-swagger-ui-recomendado)
3. [API_TESTS.http (VS Code)](#-api_testshttp-vs-code)
4. [Thunder Client](#-thunder-client-vs-code)
5. [Postman](#-postman)
6. [cURL](#-curl)
7. [Endpoints Disponíveis](#-endpoints-disponíveis)
8. [Troubleshooting](#-troubleshooting)

---

## 🚀 Preparação do Ambiente

### 1. Verificar Banco de Dados

```bash
# Teste a conexão com o PostgreSQL
psql -h 172.21.31.152 -p 5432 -U ricardodavid -d ricardodavid
```

### 2. Configurar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` em `apps/api` está configurado:

```env
# Database
DATABASE_URL="postgresql://ricardodavid:sua_senha@172.21.31.152:5432/ricardodavid?schema=public"

# JWT
JWT_SECRET="seu_secret_super_seguro_aqui"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="seu_refresh_secret_super_seguro_aqui"
JWT_REFRESH_EXPIRATION="30d"

# API
API_PORT=3000
NODE_ENV=development
```

### 3. Executar Migrations

```bash
cd apps/api
npx prisma migrate dev
```

### 4. Popular Banco com Dados de Teste (Seed)

```bash
npx prisma db seed
```

Este comando irá criar:
- ✅ 1 instituição de exemplo
- ✅ 3 usuários (1 coordenador, 2 pesquisadores)
- ✅ 6 questões de exemplo

**Credenciais de teste:**
- Email: `coordenador@teste.com` | Senha: `Senha@123`
- Email: `pesquisador1@teste.com` | Senha: `Senha@123`
- Email: `pesquisador2@teste.com` | Senha: `Senha@123`

### 5. Instalar Dependências

```bash
cd apps/api
npm install
```

### 6. Iniciar Servidor

```bash
# Modo desenvolvimento (com hot reload)
npm run start:dev

# Ou apenas
npm run dev
```

### 7. Verificar se está rodando

Abra no navegador: **http://localhost:3000/api/docs**

---

## 🎯 Swagger UI (Recomendado)

O Swagger UI é a forma mais rápida e visual de testar a API.

### Como acessar:

- **Local:** http://localhost:3000/api/docs
- **Servidor:** http://172.21.31.152:3000/api/docs

### Como usar:

#### 1. **Autenticação:**

1. Expanda o grupo **"Authentication"**
2. Clique em **POST `/auth/signin`**
3. Clique em **"Try it out"**
4. Use as credenciais de teste:
   ```json
   {
     "email": "coordenador@teste.com",
     "password": "Senha@123"
   }
   ```
5. Clique em **"Execute"**
6. Copie o `accessToken` da resposta
7. Clique no botão **"Authorize"** 🔒 (canto superior direito)
8. Cole o token no campo **Value**
9. Clique em **"Authorize"** e depois **"Close"**

#### 2. **Testando endpoints:**

1. Navegue pelos grupos de endpoints (10 grupos organizados)
2. Clique em um endpoint para expandir
3. Clique em **"Try it out"**
4. Preencha os parâmetros necessários (veja os exemplos)
5. Clique em **"Execute"**
6. Veja a resposta completa abaixo (status, headers, body)

### Vantagens:

- ✅ Interface visual intuitiva e profissional
- ✅ Documentação completa de cada endpoint com descrições
- ✅ Exemplos de request/response para todos os endpoints
- ✅ Validação automática de schemas
- ✅ Persistência do token (autorização permanece entre requisições)
- ✅ Syntax highlighting (tema monokai)
- ✅ Filtro de busca de endpoints
- ✅ Tempo de resposta exibido
- ✅ Deep scan de todas as rotas

---

## 📝 API_TESTS.http (VS Code)

Arquivo com **102 testes HTTP** já prontos para uso.

### Pré-requisitos:

Instale a extensão **REST Client** no VS Code:
- **ID:** `humao.rest-client`
- Ou busque "REST Client" na aba de extensões

### Como usar:

#### 1. **Abra o arquivo:**
```
apps/api/API_TESTS.http
```

#### 2. **Configure as variáveis:**

No topo do arquivo, ajuste se necessário:
```http
@baseUrl = http://localhost:3000
@accessToken = SEU_TOKEN_AQUI
```

#### 3. **Execute os testes:**

- Clique em **"Send Request"** acima de cada teste
- Ou use o atalho: 
  - Windows/Linux: `Ctrl+Alt+R`
  - Mac: `Cmd+Alt+R`

#### 4. **Workflow recomendado:**

1. Execute o **Teste #2 (SignIn)** primeiro
2. Copie o `accessToken` da resposta
3. Cole na variável `@accessToken` no topo do arquivo
4. Agora pode executar qualquer teste protegido

### Organização dos testes:

| Testes | Módulo | Descrição |
|--------|--------|-----------|
| 1-4 | Authentication | SignUp, SignIn, Refresh, Logout |
| 5-12 | Institutions | CRUD + Researchers + Statistics |
| 13-24 | Questions | CRUD + Import + Search + Similar |
| 25-28 | File Upload | Upload de arquivos |
| 29-32 | Users | CRUD de usuários |
| 33-35 | Validation | Testes de validação |
| 36-47 | Projects | CRUD + Coordinators + Members |
| 48-58 | Research Groups | CRUD + Members + Statistics |
| 59-69 | Questionnaires | CRUD + Participants |
| 70-80 | Field Surveys | CRUD + Participants + Duration |
| 81-91 | Approvals | CRUD + Review + Statistics |
| 92-102 | Notifications | CRUD + Read/Unread + Count |

### Vantagens:

- ✅ **102 testes prontos** para usar
- ✅ Organizado por módulos
- ✅ Exemplos de payloads válidos
- ✅ Variáveis reutilizáveis
- ✅ Histórico de requisições
- ✅ Syntax highlighting
- ✅ Resposta formatada

---

## ⚡ Thunder Client (VS Code)

Extensão similar ao Postman, integrada ao VS Code.

### Instalação:

Instale a extensão **Thunder Client**:
- **ID:** `rangav.vscode-thunder-client`
- Ou busque "Thunder Client" na aba de extensões

### Como usar:

#### 1. **Criar uma nova requisição:**

1. Abra Thunder Client na barra lateral (ícone de raio ⚡)
2. Clique em **"New Request"**
3. Configure:
   - **Método:** POST
   - **URL:** `http://localhost:3000/auth/signin`
   - **Body:** Selecione "JSON"
   ```json
   {
     "email": "coordenador@teste.com",
     "password": "Senha@123"
   }
   ```
4. Clique em **"Send"**

#### 2. **Usar o token:**

1. Copie o `accessToken` da resposta
2. Em outras requisições, vá em **"Auth"** → **"Bearer"**
3. Cole o token

#### 3. **Criar coleções:**

- Organize suas requisições por módulo
- Crie variáveis de ambiente
- Exporte/importe coleções

### Vantagens:

- ✅ Interface simples e rápida
- ✅ Integrado ao VS Code (sem precisar sair do editor)
- ✅ Suporte a variáveis de ambiente
- ✅ Histórico de requisições
- ✅ Exportação de coleções
- ✅ Testes automatizados
- ✅ Mais leve que o Postman

---

## 📮 Postman

Cliente HTTP completo e popular.

### Instalação:

- **Download:** https://www.postman.com/downloads/
- **Ou use a versão web:** https://web.postman.com/

### Como usar:

#### 1. **Criar uma coleção:**

1. Clique em **"New"** → **"Collection"**
2. Nome: **"ResearchQuest API"**

#### 2. **Configurar variáveis:**

1. Na coleção, vá em **"Variables"**
2. Adicione:
   - `baseUrl`: `http://localhost:3000`
   - `accessToken`: (deixe vazio por enquanto)

#### 3. **Criar requisição de login:**

1. **New** → **Request**
2. Nome: **"SignIn"**
3. Método: **POST**
4. URL: `{{baseUrl}}/auth/signin`
5. **Body** → **raw** → **JSON**:
   ```json
   {
     "email": "coordenador@teste.com",
     "password": "Senha@123"
   }
   ```

#### 4. **Salvar o token automaticamente:**

Na requisição de SignIn, vá em **"Tests"** e adicione:
```javascript
pm.test("Login successful", function () {
    var jsonData = pm.response.json();
    pm.collectionVariables.set("accessToken", jsonData.accessToken);
});
```

#### 5. **Usar o token:**

Em outras requisições:
1. Vá em **"Authorization"**
2. **Type:** "Bearer Token"
3. **Token:** `{{accessToken}}`

### Vantagens:

- ✅ Interface profissional completa
- ✅ Testes automatizados com scripts
- ✅ Coleções compartilháveis com equipe
- ✅ Documentação automática
- ✅ Sincronização na nuvem
- ✅ Mock servers
- ✅ Monitoramento de APIs

---

## 💻 cURL (Terminal)

Para quem prefere linha de comando.

### Login:

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coordenador@teste.com",
    "password": "Senha@123"
  }'
```

### Salvar token em variável:

```bash
# Linux/Mac
export TOKEN=$(curl -s -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"coordenador@teste.com","password":"Senha@123"}' \
  | jq -r '.accessToken')

# Windows PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/signin" -Method POST -Body '{"email":"coordenador@teste.com","password":"Senha@123"}' -ContentType "application/json"
$TOKEN = $response.accessToken
```

### Usar token em outras requisições:

```bash
# Linux/Mac
curl -X GET http://localhost:3000/institutions \
  -H "Authorization: Bearer $TOKEN"

# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/institutions" -Headers @{"Authorization"="Bearer $TOKEN"}
```

### Vantagens:

- ✅ Leve e rápido
- ✅ Scriptável (ideal para automação)
- ✅ Disponível em qualquer sistema
- ✅ Perfeito para CI/CD
- ✅ Sem necessidade de interface gráfica

---

## 📊 Endpoints Disponíveis

| Módulo | Endpoints | Total |
|--------|-----------|-------|
| **Authentication** | SignUp, SignIn, Refresh, Logout | 4 |
| **Users** | CRUD + Profile + Update Password | 13 |
| **Institutions** | CRUD + Researchers + Statistics | 8 |
| **Questions** | CRUD + Import + Search + Similar | 12 |
| **Projects** | CRUD + Coordinators + Members + Statistics | 12 |
| **Research Groups** | CRUD + Members + Statistics | 11 |
| **Questionnaires** | CRUD + Participants + Statistics | 11 |
| **Field Surveys** | CRUD + Participants + Statistics | 11 |
| **Approvals** | CRUD + Review + Statistics | 9 |
| **Notifications** | CRUD + Read/Unread + Count | 11 |
| **TOTAL** | | **102+** |

---

## 🔐 Roles e Permissões

| Role | Descrição | Permissões |
|------|-----------|------------|
| **ALUNO** | Estudante | Leitura básica |
| **PESQUISADOR** | Pesquisador | Leitura + Criação de questões |
| **COORDENADOR_GRUPO** | Coordenador de Grupo | Gestão de grupos de pesquisa |
| **COORDENADOR_PROJETO** | Coordenador de Projeto | Gestão completa de projetos |
| **DOCENTE** | Professor/Docente | Aprovações + Gestão |
| **ORIENTADOR** | Orientador | Gestão de pesquisas |
| **PRECEPTOR** | Preceptor | Supervisão |
| **VOLUNTARIO** | Voluntário | Participação limitada |
| **CONVIDADO** | Convidado | Acesso temporário limitado |

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

```bash
# Verifique se o PostgreSQL está acessível
psql -h 172.21.31.152 -p 5432 -U ricardodavid -d ricardodavid

# Se falhar, verifique:
# 1. Servidor está ligado?
# 2. Firewall permite conexão na porta 5432?
# 3. Credenciais corretas no .env?
```

### Erro: "Table does not exist"

```bash
# Execute as migrações
cd apps/api
npx prisma migrate deploy

# Ou em desenvolvimento
npx prisma migrate dev
```

### Erro: "Unauthorized" ou "401"

**Possíveis causas:**

1. **Token expirado** (15 minutos de validade)
   - Use o endpoint `/auth/refresh` para renovar
   - Ou faça login novamente

2. **Token não enviado ou formato incorreto**
   - Verifique se o header está: `Authorization: Bearer SEU_TOKEN`
   - Não envie: `Bearer: SEU_TOKEN` (errado!)

3. **Token inválido**
   - Faça login novamente
   - Copie o token completo (sem espaços extras)

### Erro: "Port 3000 already in use"

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Ou altere a porta no .env
API_PORT=3001
```

### Erro: "Validation failed"

**Exemplos comuns:**

1. **Email inválido**
   ```json
   {
     "message": ["email deve ser um endereço de e-mail válido"],
     "error": "Bad Request",
     "statusCode": 400
   }
   ```
   ✅ Use: `usuario@dominio.com`

2. **Senha fraca**
   ```json
   {
     "message": ["A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial"],
     "error": "Bad Request",
     "statusCode": 400
   }
   ```
   ✅ Use: `Senha@123` (mínimo 8 caracteres, maiúscula, minúscula, número, especial)

3. **CPF inválido**
   ```json
   {
     "message": ["CPF inválido"],
     "error": "Bad Request",
     "statusCode": 400
   }
   ```
   ✅ Use: `12345678901` (11 dígitos, sem pontos ou traços)

4. **Data inválida**
   ```json
   {
     "message": ["A data de início deve ser anterior à data de término"],
     "error": "Bad Request",
     "statusCode": 400
   }
   ```
   ✅ Verifique a ordem das datas

### Erro: "Prisma Client initialization error"

```bash
# Regenere o Prisma Client
cd apps/api
npx prisma generate
```

### Swagger não carrega

1. **Verifique se a API está rodando:**
   ```bash
   curl http://localhost:3000/api/docs
   ```

2. **Limpe cache do navegador:**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)

3. **Tente outro navegador**

### Import de arquivo não funciona

1. **Verifique o formato:**
   - Excel: `.xlsx` (não `.xls`)
   - CSV: codificação UTF-8

2. **Verifique as colunas obrigatórias:**
   - `enunciado` (obrigatório)
   - `categoria` (obrigatório)
   - Consulte `PARSERS_ADVANCED_GUIDE.md`

3. **Tamanho do arquivo:**
   - Máximo: 10MB (configurável)

---

## ✅ Checklist de Teste Completo

### 1. Autenticação
- [ ] Criar usuário (SignUp)
- [ ] Fazer login (SignIn)
- [ ] Renovar token (Refresh)
- [ ] Fazer logout (Logout)

### 2. Instituições
- [ ] Criar instituição
- [ ] Listar instituições
- [ ] Buscar instituição por ID
- [ ] Atualizar instituição
- [ ] Adicionar pesquisador
- [ ] Ver estatísticas

### 3. Projetos
- [ ] Criar projeto com CEP
- [ ] Adicionar coordenadores (mínimo 1)
- [ ] Adicionar membros com roles
- [ ] Listar projetos
- [ ] Ver estatísticas do projeto

### 4. Grupos de Pesquisa
- [ ] Criar grupo vinculado a projeto
- [ ] Adicionar membros ao grupo
- [ ] Listar grupos do projeto
- [ ] Ver estatísticas do grupo

### 5. Pesquisas de Campo
- [ ] Criar pesquisa de campo
- [ ] Adicionar participantes
- [ ] Calcular duração
- [ ] Listar pesquisas

### 6. Questionários
- [ ] Criar questionário
- [ ] Vincular a pesquisa de campo
- [ ] Adicionar participantes
- [ ] Estimar duração

### 7. Questões
- [ ] Criar questão manualmente
- [ ] Importar de Excel
- [ ] Importar de CSV
- [ ] Buscar questões similares
- [ ] Pesquisar por termo

### 8. Aprovações
- [ ] Criar solicitação de aprovação
- [ ] Listar pendentes
- [ ] Aprovar solicitação
- [ ] Rejeitar solicitação
- [ ] Ver estatísticas (taxas)

### 9. Notificações
- [ ] Criar notificação
- [ ] Listar não lidas
- [ ] Marcar como lida
- [ ] Marcar todas como lidas
- [ ] Ver contador

---

## 📚 Recursos Adicionais

- **Documentação NestJS:** https://docs.nestjs.com/
- **Documentação Prisma:** https://www.prisma.io/docs
- **Documentação Swagger:** https://swagger.io/docs/
- **Repositório GitHub:** https://github.com/RicardoDavitec/Research_Quest
- **Swagger Local:** http://localhost:3000/api/docs

---

## 🎯 Dicas de Teste

### 1. **Use o Swagger primeiro**
- Mais visual e intuitivo
- Documentação completa
- Exemplos prontos

### 2. **Crie dados na ordem correta**
1. Usuário (SignUp)
2. Instituição
3. Projeto
4. Grupo de Pesquisa
5. Pesquisa de Campo
6. Questionário
7. Questões

### 3. **Mantenha o token atualizado**
- Token expira em 15 minutos
- Use Refresh antes de expirar
- Ou faça login novamente

### 4. **Teste casos de erro**
- Dados inválidos
- IDs inexistentes
- Sem autorização
- Duplicidades

### 5. **Use variáveis de ambiente**
- No Postman: `{{baseUrl}}`, `{{token}}`
- No Thunder Client: mesma coisa
- No REST Client: `@baseUrl`, `@accessToken`

---

**Desenvolvido com ❤️ por Ricardo David**
  - Validar refresh token
  - Revogar token antigo
  - Gerar novos tokens
  - Rejeitar tokens expirados ou revogados

- [ ] **Logout** - Encerrar sessão
  - Revogar refresh token específico
  - Logout de todos os dispositivos

### ✅ Módulo de Instituições

- [ ] **Criar Instituição** (POST /institutions)
  - Validar CNPJ único
  - Validar formato de CNPJ
  - Validar coordenador existente
  - Verificar role do usuário (apenas coordenadores/docentes)
  - Formatação automática de CNPJ

- [ ] **Listar Instituições** (GET /institutions)
  - Listar todas
  - Filtrar por tipo (ACADEMICA, HOSPITAL, etc)
  - Filtrar por estado
  - Filtrar por cidade
  - Buscar por nome/CNPJ/cidade

- [ ] **Buscar por ID** (GET /institutions/:id)
  - Retornar detalhes completos
  - Incluir coordenador
  - Incluir pesquisadores (primeiros 10)
  - Incluir projetos (primeiros 10)
  - Incluir contadores

- [ ] **Listar Pesquisadores** (GET /institutions/:id/researchers)
  - Listar pesquisadores primários
  - Listar pesquisadores secundários
  - Ordenar por nome

- [ ] **Estatísticas** (GET /institutions/:id/statistics)
  - Contar pesquisadores primários
  - Contar pesquisadores secundários
  - Contar projetos totais
  - Agrupar projetos por status
  - Verificar role (apenas coordenadores)

- [ ] **Atualizar** (PATCH /institutions/:id)
  - Atualização parcial
  - Validar CNPJ único (se alterado)
  - Validar coordenador (se alterado)
  - Verificar role

- [ ] **Deletar** (DELETE /institutions/:id)
  - Impedir exclusão com dependências
  - Listar dependências na mensagem de erro
  - Verificar role

### ✅ Módulo de Questões

- [ ] **Criar Questão** (POST /questions)
  - Validar tipo de questão
  - Validar categoria e escopo
  - Resolver userId → researcherId
  - Validar campos específicos (likert, options, etc)
  - Verificar role

- [ ] **Importar em Lote** (POST /questions/import)
  - Processar múltiplas questões
  - Rastrear sucessos e falhas
  - Aplicar defaultOrigin
  - Aplicar researchGroupId padrão
  - Retornar relatório detalhado

- [ ] **Listar Questões** (GET /questions)
  - Listar todas
  - Filtrar por tipo
  - Filtrar por categoria
  - Filtrar por escopo
  - Buscar por texto
  - Paginação

- [ ] **Buscar por ID** (GET /questions/:id)
  - Retornar detalhes completos
  - Incluir criador
  - Incluir grupo de pesquisa
  - Incluir histórico de versões

- [ ] **Buscar Similares** (GET /questions/:id/similar)
  - (Requer pgVector no servidor)
  - Retornar questões semanticamente similares

- [ ] **Estatísticas** (GET /questions/statistics)
  - Agrupar por tipo
  - Agrupar por categoria
  - Agrupar por origem
  - Verificar role (apenas coordenadores)

- [ ] **Atualizar** (PATCH /questions/:id)
  - Criar nova versão (não sobrescrever)
  - Manter parentId
  - Incrementar version
  - Verificar propriedade ou role

- [ ] **Deletar** (DELETE /questions/:id)
  - Verificar uso em questionários
  - Impedir exclusão se em uso
  - Soft delete
  - Verificar propriedade ou role

### ✅ Testes de Segurança e Autorização

- [ ] **Autenticação**
  - Rejeitar requisições sem token (401)
  - Rejeitar tokens inválidos (401)
  - Rejeitar tokens expirados (401)

- [ ] **Autorização por Role**
  - ALUNO não pode criar instituições (403)
  - ALUNO não pode ver estatísticas (403)
  - Apenas coordenadores podem ver lista de usuários (403)
  - Pesquisador pode criar questões
  - Pesquisador pode importar questões

- [ ] **Validações de Dados**
  - CNPJ inválido → 400
  - Email inválido → 400
  - CPF inválido → 400
  - Senha fraca → 400
  - Telefone inválido → 400
  - CEP inválido → 400
  - Estado inválido → 400
  - ORCID inválido → 400
  - Lattes inválido → 400

- [ ] **Validações de Negócio**
  - CNPJ duplicado → 409
  - Email duplicado → 409
  - CPF duplicado → 409
  - Coordenador inexistente → 400
  - Instituição inexistente → 404
  - Questão inexistente → 404
  - Deletar com dependências → 400

---

## 📊 Cenários de Teste Completos

### Cenário 1: Fluxo Completo de Cadastro e Criação

1. ✅ SignUp como coordenador
2. ✅ SignIn e obter tokens
3. ✅ Criar instituição
4. ✅ Criar questões
5. ✅ Importar questões em lote
6. ✅ Listar questões criadas
7. ✅ Atualizar questão (versionamento)
8. ✅ Obter estatísticas

### Cenário 2: Testes de Permissões

1. ✅ SignUp como ALUNO
2. ✅ Tentar criar instituição (deve falhar)
3. ✅ Tentar ver estatísticas (deve falhar)
4. ✅ Listar questões (deve funcionar)
5. ✅ Criar questão (deve funcionar)

### Cenário 3: Refresh Token Flow

1. ✅ SignIn e obter tokens
2. ✅ Usar accessToken até expirar (15min)
3. ✅ Usar refreshToken para renovar
4. ✅ Usar novo accessToken
5. ✅ Logout (revogar refreshToken)
6. ✅ Tentar usar refreshToken revogado (deve falhar)

### Cenário 4: Importação em Lote

1. ✅ Importar 10 questões válidas
2. ✅ Verificar todas criadas com sucesso
3. ✅ Importar 10 questões (5 válidas, 5 inválidas)
4. ✅ Verificar relatório de erros
5. ✅ Confirmar que 5 foram criadas

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se o PostgreSQL está acessível
- Confirme DATABASE_URL no .env
- Teste conexão: `psql -h 172.21.31.152 -U pmfdtidev -d ricardodavid`

### Erro: "JWT_SECRET is not defined"
- Configure JWT_SECRET no arquivo .env
- Reinicie o servidor

### Erro: "Coordinator not found"
- Execute o seed novamente: `npm run prisma:seed`
- Ou crie manualmente um researcher no banco

### Erro: "Extension vector is not available"
- Isso é esperado (pgVector não instalado no servidor)
- Endpoint de similaridade retornará placeholder
- Solicitação de instalação já foi enviada ao admin

### Erro 401 em todas as requisições
- Verifique se o token está correto
- Verifique se o token não expirou (15min)
- Use refresh token para renovar

---

## 📝 Notas Importantes

1. **Tokens de Acesso**: Expiram em 15 minutos
2. **Refresh Tokens**: Expiram em 30 dias
3. **Senha de Teste**: `Senha@123` (para todos os usuários do seed)
4. **CNPJ**: Apenas números são armazenados, formatação é automática
5. **CPF**: Apenas números são armazenados, formatação é automática
6. **Versionamento**: Atualizar questão cria nova versão, não sobrescreve
7. **Soft Delete**: Questões não são removidas fisicamente do banco
8. **pgVector**: Funcionalidade de similaridade aguarda instalação no servidor

---

## ✅ Próximos Passos

Após validar os testes acima:

1. ✅ Implementar parsers de arquivo (Excel/CSV)
2. ✅ Criar endpoint de upload multipart/form-data
3. ✅ Implementar módulos restantes (Projetos, Grupos, Questionários)
4. ✅ Adicionar testes automatizados (Jest)
5. ✅ Configurar CI/CD
6. ✅ Deploy em ambiente de produção
