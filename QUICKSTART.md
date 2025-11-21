# 🚀 Guia de Início Rápido - Campo Research Platform

## 📋 O que foi implementado?

✅ **Backend API completo em NestJS** com todos os módulos funcionais:
- Autenticação JWT
- Gestão de Subgrupos, Pesquisadores, Questões, Questionários e Pesquisas
- Algoritmo de similaridade TF-IDF
- Documentação Swagger

## ⚡ Como testar agora?

### Opção 1: Usar SQL Server com Docker (Recomendado)

```powershell
# 1. Iniciar SQL Server no Docker
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Password" `
  -p 1433:1433 --name sqlserver `
  -d mcr.microsoft.com/mssql/server:2022-latest

# 2. Verificar se o arquivo .env está correto
# O arquivo já foi criado com as configurações padrão

# 3. Compilar o backend
cd backend
npm run build

# 4. Iniciar o servidor
npm run start:dev
```

### Opção 2: Usar SQL Server Local

Se você já tem SQL Server instalado:

```powershell
# 1. Criar o banco de dados
# Conecte-se ao SQL Server e execute:
CREATE DATABASE campo_research_db;

# 2. Atualizar o .env se necessário com suas credenciais

# 3. Iniciar o backend
cd backend
npm run start:dev
```

## 🎯 Testando a API

### 1. Acesse a documentação Swagger
```
http://localhost:3001/api/docs
```

### 2. Fluxo de teste básico

#### a) Criar um Subgrupo
```json
POST /subgroups
{
  "name": "Grupo de Pesquisa em Saúde",
  "description": "Pesquisas sobre saúde pública"
}
```
**Anote o `id` retornado!**

#### b) Criar um Pesquisador
```json
POST /researchers
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "subgroupId": "cole-o-id-do-subgrupo-aqui"
}
```

#### c) Fazer Login
```json
POST /auth/login
{
  "email": "joao@example.com",
  "password": "senha123"
}
```
**Copie o `access_token` retornado!**

#### d) No Swagger, clique em "Authorize" e cole o token

#### e) Criar uma Questão
```json
POST /questions
{
  "text": "Qual é o seu nível de satisfação com o atendimento?",
  "type": "scale",
  "visibility": "subgroup",
  "objective": "Avaliar a satisfação dos usuários",
  "targetGender": "all",
  "targetEducationLevel": "all",
  "authorId": "cole-o-id-do-pesquisador",
  "subgroupId": "cole-o-id-do-subgrupo"
}
```

#### f) Criar outra questão similar
```json
POST /questions
{
  "text": "Como você avalia o nível de satisfação com o atendimento recebido?",
  "type": "scale",
  "visibility": "subgroup",
  "authorId": "cole-o-id-do-pesquisador",
  "subgroupId": "cole-o-id-do-subgrupo"
}
```

#### g) Testar a detecção de similaridade
```
GET /questions/{id-da-primeira-questao}/similar?threshold=0.3
```

Você verá que a segunda questão aparece como similar à primeira! 🎉

## 📊 Estrutura das Entidades

### Question (Questão)
- `text` - Texto da questão
- `type` - Tipo: multiple_choice, yes_no, open_text, quantitative, qualitative, scale
- `visibility` - Visibilidade: private, subgroup, public
- `objective` - Objetivo da questão
- `targetAudience` - Descrição do público-alvo
- `targetGender` - Gênero: male, female, other, all
- `targetEducationLevel` - Escolaridade: none, elementary, high_school, undergraduate, graduate, postgraduate, all
- `minAge` / `maxAge` - Faixa etária
- `targetLocation` - Localização geográfica
- `restrictions` - Restrições
- `researchName` - Nome da pesquisa
- `options` - Array de opções (para múltipla escolha)
- `authorId` - ID do autor
- `subgroupId` - ID do subgrupo

### Survey (Pesquisa Operacional)
- `title` - Título da pesquisa
- `description` - Descrição
- `objectives` - Objetivos
- `targetAudience` - Público-alvo
- `locations` - Array de localizações
- `startDate` / `endDate` - Período
- `applicationMethod` - Método: online, digital, printed, recorded, filmed, interview, phone
- `status` - Status: planning, in_progress, completed, cancelled
- `questionnaireId` - ID do questionário utilizado
- `responsibleId` - ID do responsável

## 🔍 Testando a Similaridade TF-IDF

O algoritmo TF-IDF compara questões e retorna um score de 0 a 1:
- **0.0 - 0.3**: Baixa similaridade
- **0.3 - 0.6**: Similaridade moderada
- **0.6 - 1.0**: Alta similaridade

Exemplos de questões similares:
```
"Qual seu nível de satisfação?" ≈ "Como você avalia sua satisfação?"
"Você tem plano de saúde?" ≈ "Possui algum tipo de plano de saúde?"
"Qual sua idade?" ≈ "Quantos anos você tem?"
```

## 🎨 Interface Visual (Próximo Passo)

O frontend será desenvolvido com:
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes prontos
- **React Query** - Gestão de estado e cache

Funcionalidades planejadas:
- Dashboard com estatísticas
- Editor de questões com preview
- Visualização de questões similares em tempo real
- Criador de questionários drag-and-drop
- Gestão de pesquisas com calendário
- Relatórios e exportação

## 📝 Comandos Úteis

```powershell
# Ver logs do SQL Server (Docker)
docker logs sqlserver

# Parar SQL Server
docker stop sqlserver

# Iniciar SQL Server novamente
docker start sqlserver

# Remover SQL Server
docker rm -f sqlserver

# Verificar se o backend está rodando
curl http://localhost:3001/api/docs

# Ver erros em tempo real
cd backend
npm run start:dev
```

## 🐛 Problemas Comuns

### "Cannot connect to database"
- Verifique se o SQL Server está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `docker ps` (deve mostrar o container)

### "Port 3001 already in use"
- Algum processo está usando a porta
- Altere a porta no arquivo `.env`: `PORT=3002`
- Ou encerre o processo: `netstat -ano | findstr :3001`

### "Entity not found"
- Execute as migrations: `npm run migration:run`
- Ou habilite `synchronize: true` no `data-source.ts` (apenas desenvolvimento!)

## ✅ Checklist de Implementação

- [x] Estrutura do projeto
- [x] Entidades do banco de dados
- [x] Módulos NestJS
- [x] Controllers e Services
- [x] DTOs e validação
- [x] Autenticação JWT
- [x] Algoritmo TF-IDF
- [x] Documentação Swagger
- [x] Compilação sem erros
- [ ] Banco de dados configurado
- [ ] Migrations executadas
- [ ] Testes da API
- [ ] Frontend Next.js
- [ ] Deploy

## 🚀 Status Atual

**Backend: 100% Completo** ✅

Você pode começar a testar a API agora mesmo seguindo os passos acima!

---

**Precisa de ajuda?** Consulte o arquivo `API-DOCS.md` para documentação completa dos endpoints.
