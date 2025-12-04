# Guia de Testes - ResearchQuest API

## 🚀 Preparação do Ambiente

### 1. Configurar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` em `apps/api` está configurado:

```env
DATABASE_URL="postgresql://pmfdtidev:pmfdtipwd@172.21.31.152:5432/ricardodavid?schema=public"
JWT_SECRET="sua-chave-secreta-super-segura-aqui"
JWT_EXPIRATION="15m"
```

### 2. Executar Migrations

```bash
cd apps/api
npm run prisma:migrate
```

### 3. Popular Banco com Dados de Teste (Seed)

```bash
npm run prisma:seed
```

Este comando irá criar:
- ✅ 3 usuários (1 coordenador, 2 pesquisadores)
- ✅ 2 instituições
- ✅ 6 questões de exemplo

**Credenciais de teste:**
- Email: `coordenador@teste.com` | Senha: `Senha@123`
- Email: `pesquisador1@teste.com` | Senha: `Senha@123`
- Email: `pesquisador2@teste.com` | Senha: `Senha@123`

### 4. Iniciar Servidor

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000`

---

## 🧪 Executando Testes

### Opção 1: Thunder Client (VS Code Extension)

1. Instale a extensão **Thunder Client** no VS Code
2. Abra o arquivo `API_TESTS.http`
3. Execute as requisições clicando em "Send Request"

### Opção 2: REST Client (VS Code Extension)

1. Instale a extensão **REST Client** no VS Code
2. Abra o arquivo `API_TESTS.http`
3. Clique em "Send Request" acima de cada requisição

### Opção 3: cURL (Terminal)

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coordenador@teste.com",
    "password": "Senha@123"
  }'

# Copie o accessToken da resposta e use nas próximas requisições

# 2. Listar Instituições
curl -X GET http://localhost:3000/institutions \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 3. Listar Questões
curl -X GET http://localhost:3000/questions \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📋 Checklist de Testes

### ✅ Módulo de Autenticação

- [ ] **SignUp** - Criar novo usuário
  - Validar formato de email
  - Validar força da senha
  - Validar formato de CPF
  - Verificar duplicidade de email/CPF
  - Criar User + Researcher em transação
  - Retornar accessToken e refreshToken

- [ ] **SignIn** - Login
  - Validar credenciais
  - Retornar accessToken e refreshToken
  - Rejeitar credenciais inválidas

- [ ] **Refresh Token** - Renovar tokens
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
