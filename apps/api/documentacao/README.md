# Documentação do Sistema Research Quest API

Esta pasta contém toda a documentação técnica e guias de uso da API do Research Quest.

## 📚 Índice de Documentação

### Guias de Funcionalidades

#### [IMPORT_GUIDE.md](./IMPORT_GUIDE.md)
Guia completo sobre importação de questões via arquivo Excel e CSV.
- **Conteúdo:**
  - Especificação de colunas e campos obrigatórios/opcionais
  - Valores válidos para enums (QuestionType, QuestionCategory, QuestionScope)
  - 6 exemplos detalhados de preenchimento por tipo de questão
  - Instruções de upload (Thunder Client, cURL, Postman)
  - Formatos JSON para campos complexos
  - Tratamento de erros e troubleshooting
- **Quando usar:** Ao importar questões em lote através de planilhas

#### [TESTING_GUIDE.md](./TESTING_GUIDE.md)
Documentação completa sobre testes da API.
- **Conteúdo:**
  - Preparação do ambiente de testes
  - Instruções para 3 ferramentas (Thunder Client, REST Client, cURL)
  - Checklist por módulo: Autenticação, Instituições, Questões, Segurança
  - 4 cenários de teste completos (fluxo de autenticação, CRUD, importação, segurança)
  - Troubleshooting e dicas importantes
- **Quando usar:** Ao testar endpoints da API manualmente

### Guias de Autenticação

#### [REFRESH_TOKEN_GUIDE.md](./REFRESH_TOKEN_GUIDE.md)
Explicação detalhada sobre o sistema de refresh tokens.
- **Conteúdo:**
  - Arquitetura de tokens (JWT 15min + Refresh Token 30 dias)
  - Fluxo de refresh automático
  - Estrutura da tabela RefreshToken no banco
  - Endpoints relacionados
  - Códigos de exemplo
- **Quando usar:** Ao implementar ou debugar autenticação no frontend

#### [SIGNUP_EXAMPLE.md](./SIGNUP_EXAMPLE.md)
Exemplos práticos de cadastro de usuários.
- **Conteúdo:**
  - Estrutura do payload de signup
  - Validações de senha e dados obrigatórios
  - Exemplos de requisição para cada tipo de usuário
  - Respostas esperadas
- **Quando usar:** Ao implementar tela de cadastro ou criar usuários de teste

### Guias de Banco de Dados

#### [QUESTION_ORIGIN_FIELD.md](./QUESTION_ORIGIN_FIELD.md)
Documentação sobre o campo de origem das questões.
- **Conteúdo:**
  - Propósito do campo `origin`
  - Valores possíveis (CREATED, IMPORTED, TEMPLATE)
  - Quando cada valor é aplicado
  - Uso em filtros e relatórios
- **Quando usar:** Ao trabalhar com questões e entender sua procedência

## 🚀 Início Rápido

### 1. Configurar Ambiente de Testes
```bash
# Instalar dependências
npm install

# Executar migrations
npm run prisma:migrate

# Popular banco com dados de teste
npm run prisma:seed
```

### 2. Testar Autenticação
```bash
# Ver TESTING_GUIDE.md seção "Autenticação"
# Credenciais de teste disponíveis no seed:
# - coordenador@teste.com / Senha@123
# - pesquisador1@teste.com / Senha@123
```

### 3. Importar Questões
```bash
# Ver IMPORT_GUIDE.md para baixar templates
# Endpoints:
# GET /questions/templates/excel
# GET /questions/templates/csv
# POST /questions/upload/excel
# POST /questions/upload/csv
```

## 📖 Convenções

### Estrutura de Documentação
- **Guias práticos:** Passo a passo com exemplos
- **Referências técnicas:** Especificações detalhadas
- **Troubleshooting:** Seção ao final de cada guia

### Formato de Exemplos
```typescript
// Código TypeScript com comentários explicativos
```

```bash
# Comandos de terminal com contexto
```

```json
// Payloads de requisição/resposta
```

## 🔧 Ferramentas Recomendadas

### Para Testes de API
1. **Thunder Client** (extensão VS Code) - Recomendado para desenvolvimento
2. **REST Client** (extensão VS Code) - Usa arquivo .http
3. **cURL** - Para scripts e CI/CD

### Para Consultas ao Banco
1. **Prisma Studio** - Interface visual
   ```bash
   npm run prisma:studio
   ```
2. **pgAdmin** - Cliente PostgreSQL completo

## 📝 Atualizações

Última atualização: 04/12/2025

### Novas Funcionalidades Documentadas
- ✅ Sistema de parsers Excel/CSV
- ✅ Upload de arquivos multipart/form-data
- ✅ Templates para download
- ✅ Módulo de Instituições CRUD
- ✅ Infraestrutura de testes

## 🤝 Contribuindo

Ao adicionar nova funcionalidade:
1. Crie documentação correspondente nesta pasta
2. Atualize este README.md com link e descrição
3. Adicione exemplos práticos
4. Inclua seção de troubleshooting se aplicável

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação relevante
2. Verifique a seção de troubleshooting
3. Execute os testes com dados de seed
4. Consulte os logs da aplicação
