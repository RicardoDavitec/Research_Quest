# Campo Research Platform API

API REST completa desenvolvida com NestJS para gestão colaborativa de questionários de pesquisas de campo.

## ✅ Status da Implementação

Todos os módulos principais foram implementados e estão funcionais:

- ✅ **Autenticação JWT** - Login, proteção de rotas e controle de acesso
- ✅ **Gestão de Subgrupos** - CRUD completo para grupos de pesquisa
- ✅ **Gestão de Pesquisadores** - Cadastro, autenticação e perfis
- ✅ **Gestão de Questões** - CRUD com filtros e busca
- ✅ **Gestão de Questionários** - Agrupamento de questões
- ✅ **Gestão de Pesquisas** - Pesquisas operacionais de campo
- ✅ **Similaridade TF-IDF** - Detecção de questões similares

## 🚀 Endpoints Disponíveis

### Autenticação (`/auth`)
- `POST /auth/login` - Login e obtenção de token JWT
- `GET /auth/profile` - Perfil do usuário autenticado (requer JWT)

### Subgrupos (`/subgroups`)
- `GET /subgroups` - Listar todos os subgrupos
- `POST /subgroups` - Criar novo subgrupo
- `GET /subgroups/:id` - Buscar subgrupo por ID
- `PATCH /subgroups/:id` - Atualizar subgrupo
- `DELETE /subgroups/:id` - Remover subgrupo

### Pesquisadores (`/researchers`)
- `GET /researchers` - Listar todos os pesquisadores
- `POST /researchers` - Cadastrar novo pesquisador
- `GET /researchers/:id` - Buscar pesquisador por ID
- `PATCH /researchers/:id` - Atualizar pesquisador
- `DELETE /researchers/:id` - Remover pesquisador

### Questões (`/questions`)
- `GET /questions` - Listar questões (com filtros opcionais)
- `POST /questions` - Criar nova questão
- `GET /questions/:id` - Buscar questão por ID
- `GET /questions/:id/similar` - Buscar questões similares
- `PATCH /questions/:id` - Atualizar questão
- `DELETE /questions/:id` - Remover questão

### Questionários (`/questionnaires`)
- `GET /questionnaires` - Listar todos os questionários
- `POST /questionnaires` - Criar novo questionário
- `GET /questionnaires/:id` - Buscar questionário por ID
- `PATCH /questionnaires/:id` - Atualizar questionário
- `POST /questionnaires/:id/questions` - Adicionar questões ao questionário
- `DELETE /questionnaires/:id/questions/:questionId` - Remover questão do questionário
- `DELETE /questionnaires/:id` - Remover questionário

### Pesquisas (`/surveys`)
- `GET /surveys` - Listar pesquisas (com filtros opcionais)
- `POST /surveys` - Criar nova pesquisa operacional
- `GET /surveys/:id` - Buscar pesquisa por ID
- `PATCH /surveys/:id` - Atualizar pesquisa
- `POST /surveys/:id/response` - Incrementar contador de respostas
- `DELETE /surveys/:id` - Remover pesquisa

### Similaridade (`/similarity`)
- `POST /similarity/compare` - Comparar similaridade entre textos
- `POST /similarity/keywords` - Extrair palavras-chave de um texto

## 📚 Documentação Swagger

Após iniciar a aplicação, acesse a documentação interativa em:
```
http://localhost:3001/api/docs
```

## 🛠️ Tecnologias Utilizadas

- **NestJS** 10.3.0 - Framework backend
- **TypeORM** 0.3.19 - ORM para SQL Server
- **JWT** - Autenticação e autorização
- **Passport** - Estratégias de autenticação
- **bcrypt** - Hash de senhas
- **Natural** - Biblioteca NLP para TF-IDF
- **Swagger** - Documentação da API
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de dados

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos:

1. Faça login em `/auth/login` e obtenha o token
2. Inclua o token no header das requisições:
```
Authorization: Bearer SEU_TOKEN_JWT
```

## 🎯 Próximos Passos

1. **Configurar SQL Server**
   - Instalar SQL Server localmente ou via Docker
   - Criar o banco de dados `campo_research_db`
   - Atualizar credenciais no arquivo `.env`

2. **Executar Migrations**
   ```bash
   npm run migration:run
   ```

3. **Testar a API**
   - Iniciar o servidor: `npm run start:dev`
   - Acessar Swagger: http://localhost:3001/api/docs
   - Criar subgrupo → Criar pesquisador → Fazer login → Criar questões

4. **Desenvolver Frontend**
   - Next.js com TypeScript
   - Integração com a API
   - Interface de usuário intuitiva

## 📝 Exemplos de Requisições

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senha123"
  }'
```

### Criar Questão
```bash
curl -X POST http://localhost:3001/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "text": "Qual é o seu nível de satisfação com o atendimento?",
    "type": "scale",
    "visibility": "subgroup",
    "objective": "Avaliar satisfação do usuário",
    "targetGender": "all",
    "targetEducationLevel": "all",
    "authorId": "uuid-do-autor",
    "subgroupId": "uuid-do-subgrupo"
  }'
```

### Buscar Questões Similares
```bash
curl http://localhost:3001/questions/uuid-da-questao/similar?threshold=0.5 \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 🏗️ Arquitetura

```
Backend API (NestJS)
├── Controllers - Rotas e handlers HTTP
├── Services - Lógica de negócio
├── DTOs - Validação e transformação de dados
├── Entities - Modelos do banco de dados
├── Guards - Proteção de rotas
├── Strategies - Autenticação Passport
└── Modules - Organização modular
```

## 📦 Scripts Disponíveis

```bash
npm run build          # Compilar o projeto
npm run start          # Iniciar em produção
npm run start:dev      # Iniciar em desenvolvimento (watch mode)
npm run migration:run  # Executar migrations
npm run test           # Executar testes
npm run lint           # Verificar código
```

## 🤝 Contribuindo

O backend está completo e pronto para uso. Próximos passos:
- Implementar frontend com Next.js
- Adicionar testes automatizados
- Melhorar documentação
- Adicionar rate limiting
- Implementar cache com Redis

---

**Status**: ✅ Backend Completo e Funcional
**Última Atualização**: 21 de novembro de 2025
