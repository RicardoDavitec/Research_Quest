# Campo Origin - Tabela Questions

## Descrição
O campo `origin` indica a origem/fonte de criação da questão no sistema ResearchQuest.

## Tipo de Dados
- **Tipo:** String (TEXT)
- **Valor padrão:** "MANUAL"
- **Nullable:** Sim (opcional)

## Valores Possíveis

### Criação Manual
- `MANUAL` - Questão criada manualmente pelo pesquisador através da interface do sistema

### Geração por IA
- `AI_CLAUDE` - Gerada por Claude (Anthropic)
- `AI_GPT` - Gerada por ChatGPT/GPT-4 (OpenAI)
- `AI_DEEPSEEK` - Gerada por DeepSeek AI
- `AI_GEMINI` - Gerada por Google Gemini
- `AI_LLAMA` - Gerada por Meta Llama
- `AI_MISTRAL` - Gerada por Mistral AI
- `AI_CUSTOM` - Gerada por outro modelo de IA customizado

### Importação de Fontes Externas
- `IMPORTED_EXCEL` - Importada de arquivo Excel (.xlsx, .xls)
- `IMPORTED_CSV` - Importada de arquivo CSV
- `IMPORTED_JSON` - Importada de arquivo JSON
- `IMPORTED_XML` - Importada de arquivo XML
- `GOOGLE_FORMS` - Importada de Google Forms
- `MICROSOFT_FORMS` - Importada de Microsoft Forms
- `TYPEFORM` - Importada de Typeform
- `SURVEYMONKEY` - Importada de SurveyMonkey
- `QUALTRICS` - Importada de Qualtrics

### Bancos de Questões
- `BANCO_QUESTOES_SUS` - Importada de banco de questões do SUS
- `BANCO_QUESTOES_IBGE` - Importada de questionários do IBGE
- `BANCO_QUESTOES_INSTITUCIONAL` - Importada de banco institucional
- `BANCO_QUESTOES_PUBLICO` - Importada de repositório público
- `BANCO_QUESTOES_ACADEMICO` - Importada de repositório acadêmico

### Outras Fontes
- `API_EXTERNA` - Obtida via API externa
- `MIGRACAO` - Migrada de sistema legado
- `DUPLICADA` - Duplicada de outra questão existente
- `VERSIONADA` - Nova versão de questão existente
- `UNKNOWN` - Origem desconhecida/não especificada

## Exemplos de Uso

### Criação Manual
```typescript
const question = await prisma.question.create({
  data: {
    text: "Qual é a sua idade?",
    type: "NUMERICA",
    origin: "MANUAL",
    creatorId: userId,
    // ...outros campos
  },
});
```

### Geração por IA
```typescript
const aiQuestion = await prisma.question.create({
  data: {
    text: "Como você avalia seu estado de saúde geral?",
    type: "ESCALA_LIKERT",
    origin: "AI_CLAUDE",
    creatorId: userId,
    // ...outros campos
  },
});
```

### Importação de Excel
```typescript
const importedQuestions = await prisma.question.createMany({
  data: questionsFromExcel.map(q => ({
    text: q.text,
    type: q.type,
    origin: "IMPORTED_EXCEL",
    creatorId: userId,
    // ...outros campos
  })),
});
```

### Importação de Google Forms
```typescript
const googleFormsQuestion = await prisma.question.create({
  data: {
    text: "Você já participou de pesquisas anteriormente?",
    type: "SIM_NAO",
    origin: "GOOGLE_FORMS",
    creatorId: userId,
    // ...outros campos
  },
});
```

## Consultas Úteis

### Listar questões por origem
```typescript
const manualQuestions = await prisma.question.findMany({
  where: { origin: "MANUAL" },
});

const aiQuestions = await prisma.question.findMany({
  where: { 
    origin: { 
      startsWith: "AI_" 
    } 
  },
});

const importedQuestions = await prisma.question.findMany({
  where: { 
    origin: { 
      startsWith: "IMPORTED_" 
    } 
  },
});
```

### Estatísticas por origem
```sql
SELECT origin, COUNT(*) as total
FROM questions
GROUP BY origin
ORDER BY total DESC;
```

### Questões criadas por IA nos últimos 30 dias
```typescript
const aiQuestionsRecent = await prisma.question.findMany({
  where: {
    origin: {
      startsWith: "AI_",
    },
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  },
});
```

## Futuras Implementações

1. **Validação de Origem:** Criar enum TypeScript para validar valores permitidos
2. **Metadados Adicionais:** Adicionar campo JSON para armazenar metadados específicos da origem (ex: ID do formulário original, versão da IA, etc.)
3. **Auditoria:** Registrar histórico de importações/gerações
4. **Dashboard:** Exibir gráficos com distribuição de questões por origem

## Migration Aplicada

```sql
-- Migration: 20251204101142_add_question_origin_field
ALTER TABLE "questions" ADD COLUMN "origin" TEXT DEFAULT 'MANUAL';
```

## Notas

- O valor padrão "MANUAL" é aplicado automaticamente para questões existentes
- Recomenda-se sempre especificar a origem ao criar questões via importação ou IA
- O campo é opcional, mas fortemente recomendado para rastreabilidade
- Valores personalizados podem ser adicionados conforme necessário
