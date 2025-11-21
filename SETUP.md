# Campo Research Platform - Setup Instructions

## 🔧 Pré-requisitos Instalados

- ✅ Git
- ✅ Node.js v24.11.1

## 📦 Próximos Passos para Instalação

### 1. Fechar e Reabrir o VS Code

Para que as variáveis de ambiente do Node.js sejam carregadas corretamente, **feche e reabra o VS Code**.

### 2. Instalar Dependências do Backend

Após reabrir o VS Code, execute:

```powershell
cd backend
npm install
```

Ou execute o script batch:
```powershell
.\install-backend.bat
```

### 3. Configurar Banco de Dados SQL Server

#### Opção A: SQL Server Local

1. Instale o SQL Server Express (se não tiver):
   - Download: https://www.microsoft.com/sql-server/sql-server-downloads

2. Crie o banco de dados:
```sql
CREATE DATABASE campo_research_db;
```

#### Opção B: Docker (Recomendado)

```powershell
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Password" `
  -p 1433:1433 --name sqlserver `
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### 4. Configurar Variáveis de Ambiente

```powershell
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Password
DB_DATABASE=campo_research_db
JWT_SECRET=sua-chave-secreta-aqui
```

### 5. Executar Migrations

```powershell
cd backend
npm run migration:run
```

### 6. Iniciar o Backend

```powershell
cd backend
npm run start:dev
```

O backend estará disponível em: http://localhost:3001
Documentação da API: http://localhost:3001/api/docs

## 📱 Frontend (Próximo Passo)

Após o backend estar funcionando, configuraremos o frontend Next.js.

## 🐙 Criar Repositório no GitHub

### 1. Criar repositório no GitHub

Acesse https://github.com/new e crie um repositório público chamado `campo-research-platform`

### 2. Fazer commit inicial e push

```powershell
git add .
git commit -m "feat: initial project structure with NestJS backend and entities"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/campo-research-platform.git
git push -u origin main
```

## 📚 Estrutura Criada

```
campo-research-platform/
├── backend/
│   ├── src/
│   │   ├── auth/              # Autenticação JWT
│   │   ├── subgroups/         # Entidade e módulo de subgrupos
│   │   ├── researchers/       # Entidade e módulo de pesquisadores
│   │   ├── questions/         # Entidade e módulo de questões
│   │   ├── questionnaires/    # Entidade e módulo de questionários
│   │   ├── surveys/           # Entidade e módulo de pesquisas
│   │   ├── similarity/        # Serviço de similaridade TF-IDF
│   │   ├── database/          # Configuração TypeORM
│   │   ├── app.module.ts      # Módulo principal
│   │   └── main.ts            # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── README.md
├── .gitignore
└── package.json
```

## ✅ Entidades do Banco de Dados Criadas

- **Subgroup**: Grupos de pesquisa
- **Researcher**: Usuários/pesquisadores com autenticação
- **Question**: Questões com todos os campos solicitados:
  - Texto, tipo, visibilidade
  - Público-alvo (gênero, idade, escolaridade, localidade)
  - Objetivo, restrições
  - Autor, subgrupo, nome da pesquisa
- **Questionnaire**: Agrupamento de questões
- **Survey**: Pesquisas operacionais completas

## 🚀 Status Atual

- ✅ Estrutura do projeto criada
- ✅ Entidades do banco de dados definidas
- ✅ Módulos NestJS configurados
- ✅ Dependências instaladas
- ✅ Controllers e services implementados
- ✅ Algoritmo de similaridade TF-IDF implementado
- ✅ Sistema de autenticação JWT implementado
- ⏳ Configurar banco de dados SQL Server
- ⏳ Executar migrations
- ⏳ Testar API
- ⏳ Frontend Next.js
