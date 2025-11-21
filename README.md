# Plataforma de Desenvolvimento de Questionários de Pesquisas de Campo Compartilhadas

Sistema web para registro, controle e gerenciamento de questões para pesquisas de campo em saúde digital, com suporte para múltiplos subgrupos de pesquisa.

## 🎯 Funcionalidades Principais

- **Banco de Questões Compartilhado**: Registro detalhado com metadados (público-alvo, restrições, tipo, visibilidade)
- **Detecção de Similaridade**: Algoritmo TF-IDF + Cosine Similarity para identificar questões duplicadas
- **Gerenciamento Multi-Grupo**: 5 subgrupos de pesquisa com controle de acesso granular
- **Criação de Questionários**: Agrupamento de questões para pesquisas específicas
- **Gestão de Pesquisas Operacionais**: Planejamento e acompanhamento de pesquisas de campo

## 🏗️ Arquitetura

### Backend (NestJS)
- **Framework**: NestJS com TypeScript
- **Banco de Dados**: SQL Server
- **ORM**: TypeORM
- **Autenticação**: JWT + Passport

### Frontend (Next.js)
- **Framework**: Next.js 14+ com App Router
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: React Query

## 📋 Pré-requisitos

- Node.js 18+ 
- SQL Server 2019+
- npm ou yarn

## 🚀 Como Executar

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente no .env
npm run migration:run
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Configure a URL da API
npm run dev
```

## 🗂️ Estrutura do Projeto

```
campo-research-platform/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticação e autorização
│   │   ├── subgroups/      # Gestão de subgrupos
│   │   ├── researchers/    # Gestão de pesquisadores
│   │   ├── questions/      # CRUD de questões
│   │   ├── questionnaires/ # Criação de questionários
│   │   ├── surveys/        # Pesquisas operacionais
│   │   ├── similarity/     # Algoritmo de similaridade
│   │   └── database/       # Configuração TypeORM
│   └── package.json
├── frontend/               # App Next.js
│   ├── src/
│   │   ├── app/           # App Router
│   │   ├── components/    # Componentes React
│   │   ├── lib/          # Utilidades e API client
│   │   └── types/        # TypeScript types
│   └── package.json
├── docs/                  # Documentação
└── README.md
```

## 📊 Modelo de Dados

### Principais Entidades

- **Subgroup**: Grupos de pesquisa
- **Researcher**: Pesquisadores (usuários do sistema)
- **Question**: Questões individuais com metadados completos
- **Questionnaire**: Agrupamentos de questões
- **Survey**: Pesquisas operacionais de campo

## 🔒 Segurança e LGPD

- Autenticação JWT com tokens seguros
- Controle de acesso baseado em subgrupos
- Auditoria completa de operações
- Criptografia de dados sensíveis

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Equipe

Projeto desenvolvido para pesquisa em saúde digital com 5 subgrupos de pesquisa.

## 📞 Contato

Para dúvidas e sugestões, abra uma issue no repositório.
