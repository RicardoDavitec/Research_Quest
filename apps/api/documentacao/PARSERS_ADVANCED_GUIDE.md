# Guia Avançado de Parsers Excel/CSV

Este guia complementa o [IMPORT_GUIDE.md](./IMPORT_GUIDE.md) com informações técnicas detalhadas sobre os parsers de arquivo.

## 📋 Índice

1. [Arquitetura dos Parsers](#arquitetura-dos-parsers)
2. [Validações Implementadas](#validações-implementadas)
3. [Formatos Suportados](#formatos-suportados)
4. [Tratamento de Erros](#tratamento-de-erros)
5. [Otimizações e Performance](#otimizações-e-performance)
6. [Casos de Uso Avançados](#casos-de-uso-avançados)
7. [Troubleshooting Avançado](#troubleshooting-avançado)

## 🏗️ Arquitetura dos Parsers

### FileParserService

Localização: `apps/api/src/modules/questions/file-parser.service.ts`

#### Principais Métodos

```typescript
// Parser Excel - Leitura em memória
async parseExcel(buffer: Buffer): Promise<ParsedQuestion[]>

// Parser CSV - Streaming para grandes arquivos
async parseCsv(buffer: Buffer): Promise<ParsedQuestion[]>

// Validação de upload
validateFileUpload(file: Express.Multer.File, allowedExtensions: string[], maxSizeInMB: number): void

// Geração de templates
generateExcelTemplate(): Buffer
generateCsvTemplate(): string
```

### Fluxo de Processamento

```
┌─────────────────┐
│  Upload HTTP    │
│  (Multer)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validação de    │
│ Arquivo         │
│ - Tamanho       │
│ - Extensão      │
│ - MIME type     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parser          │
│ (Excel ou CSV)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validação de    │
│ Cada Linha      │
│ - Campos obrig. │
│ - Enums         │
│ - Tipo-específ. │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Importação      │
│ no Banco        │
└─────────────────┘
```

## ✅ Validações Implementadas

### 1. Validação de Arquivo

```typescript
// Tamanho máximo: 10MB (configurável)
maxSize: 10 * 1024 * 1024 bytes

// Extensões permitidas
Excel: ['.xlsx', '.xls']
CSV: ['.csv']

// MIME types aceitos
Excel: [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
]
CSV: [
  'text/csv',
  'text/plain',
  'application/csv'
]
```

### 2. Validação de Campos Obrigatórios

```typescript
const missingFields = [];
if (!row.text) missingFields.push('text');
if (!row.type) missingFields.push('type');
if (!row.category) missingFields.push('category');
if (!row.scope) missingFields.push('scope');

// Erro se algum campo faltar
if (missingFields.length > 0) {
  throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
}
```

### 3. Validação de Comprimento

| Campo | Mínimo | Máximo |
|-------|--------|--------|
| text | 10 caracteres | 1000 caracteres |
| helpText | - | 500 caracteres |
| objective | - | 500 caracteres |
| targetAudience | - | 200 caracteres |

### 4. Validação de Enums

```typescript
// QuestionType
NUMERICA
MULTIPLA_ESCOLHA
ESCALA_LIKERT
SIM_NAO
TEXTO_ABERTO
DATA
HORA

// QuestionCategory
DEMOGRAFICA
COMPORTAMENTAL
ATITUDINAL
CONHECIMENTO
SATISFACAO
QUALITATIVA

// QuestionScope
LOCAL
INSTITUCIONAL
REGIONAL
NACIONAL
INTERNACIONAL
TEMATICO
OUTRO
```

**Nota:** Os parsers aceitam valores com espaços e case-insensitive. Exemplos válidos:
- `"multipla escolha"` → `MULTIPLA_ESCOLHA`
- `"Escala Likert"` → `ESCALA_LIKERT`
- `"SIM NAO"` → `SIM_NAO`

### 5. Validações Específicas por Tipo

#### NUMERICA
```typescript
// minValue e maxValue devem ser números finitos
if (minValue > maxValue) {
  throw new Error('minValue não pode ser maior que maxValue');
}
```

#### MULTIPLA_ESCOLHA
```typescript
// Mínimo 2 opções, máximo 20
if (choices.length < 2) throw new Error('Mínimo 2 opções');
if (choices.length > 20) throw new Error('Máximo 20 opções');

// Não pode haver duplicatas (case-insensitive)
const unique = new Set(choices.map(c => c.toLowerCase()));
if (unique.size !== choices.length) {
  throw new Error('Opções duplicadas detectadas');
}

// Nenhuma opção pode ser vazia
if (choices.some(c => c.trim() === '')) {
  throw new Error('Todas as opções devem ter texto');
}
```

#### ESCALA_LIKERT
```typescript
// likertMin e likertMax obrigatórios
if (likertMin === undefined || likertMax === undefined) {
  throw new Error('likertMin e likertMax são obrigatórios');
}

// likertMin < likertMax
if (likertMin >= likertMax) {
  throw new Error('likertMin deve ser menor que likertMax');
}

// Range: mínimo 1, máximo 10 pontos
const range = likertMax - likertMin;
if (range < 1) throw new Error('Mínimo 2 pontos na escala');
if (range > 10) throw new Error('Máximo 11 pontos na escala');

// likertLabels deve ter labels para min e max
if (likertLabels) {
  if (!likertLabels[likertMin] || !likertLabels[likertMax]) {
    throw new Error('Deve ter labels para valores mínimo e máximo');
  }
}
```

#### SIM_NAO
```typescript
// Não deve ter campos incompatíveis
if (options) throw new Error('Sim/Não não deve ter options');
if (likertMin || likertMax) throw new Error('Sim/Não não deve ter campos Likert');
```

#### TEXTO_ABERTO
```typescript
// validationRegex deve ser regex válida
if (validationRegex) {
  try {
    new RegExp(validationRegex);
  } catch {
    throw new Error('validationRegex inválida');
  }
}
```

## 📁 Formatos Suportados

### Excel (.xlsx, .xls)

#### Características
- **Biblioteca:** `xlsx` (SheetJS)
- **Método de leitura:** Buffer em memória
- **Múltiplas planilhas:** Usa a primeira planilha
- **Linhas vazias:** Automaticamente ignoradas
- **Encoding:** Automático
- **Datas:** Convertidas automaticamente

#### Opções de Leitura
```typescript
XLSX.read(buffer, {
  type: 'buffer',
  cellDates: true,  // Converte datas
  cellNF: false,    // Não preserva formato original
  cellText: false   // Usa valor calculado
});
```

#### Templates Excel
- **Planilha 1 (Questões):** 6 exemplos de todos os tipos
- **Planilha 2 (Instruções):** Guia completo de preenchimento
- **Larguras de coluna:** Ajustadas para boa visualização
- **Formato:** `.xlsx` (Office Open XML)

### CSV (.csv)

#### Características
- **Biblioteca:** `csv-parser`
- **Método de leitura:** Stream (eficiente para arquivos grandes)
- **Delimitadores suportados:** `,` (vírgula) ou `;` (ponto-e-vírgula)
- **Detecção automática:** Analisa primeira linha para determinar delimitador
- **Encoding:** UTF-8 (primário) ou Latin1 (fallback)
- **Linhas vazias:** Automaticamente ignoradas

#### Detecção de Encoding
```typescript
// 1. Tenta UTF-8
csvContent = buffer.toString('utf-8');

// 2. Se detectar caracteres inválidos (�), usa Latin1
if (csvContent.includes('�')) {
  csvContent = buffer.toString('latin1');
}
```

#### Detecção de Delimitador
```typescript
const firstLine = csvContent.split('\n')[0];
const commaCount = (firstLine.match(/,/g) || []).length;
const semicolonCount = (firstLine.match(/;/g) || []).length;

// Usa o mais frequente
return semicolonCount > commaCount ? ';' : ',';
```

#### Opções do Parser
```typescript
csvParser({
  separator: delimiter,        // Delimitador detectado
  mapHeaders: ({ header }) => header.trim(),  // Remove espaços dos cabeçalhos
  mapValues: ({ value }) => value.trim(),     // Remove espaços dos valores
  skipEmptyLines: true,        // Ignora linhas vazias
})
```

### Formatos Alternativos para Campo `options`

O parser aceita 3 formatos diferentes para facilitar o preenchimento:

#### 1. JSON Completo (Recomendado)
```json
{"choices":["Opção A","Opção B","Opção C"]}
```

#### 2. Array JSON Direto
```json
["Opção A","Opção B","Opção C"]
```
Será automaticamente convertido para `{"choices":[...]}`

#### 3. Pipe-Separated (Mais Simples)
```
Opção A|Opção B|Opção C
```
Ideal para CSV, evita problemas com aspas e vírgulas.

**Exemplo no CSV:**
```csv
text,type,options
"Escolha uma cor",MULTIPLA_ESCOLHA,"Vermelho|Verde|Azul|Amarelo"
```

### Formatos para Valores Booleanos

O parser `parseBoolean()` aceita múltiplos formatos:

| Valores Verdadeiros | Valores Falsos |
|---------------------|----------------|
| true | false |
| 1 | 0 |
| sim | não / nao |
| yes | no |
| s | n |
| y | - |
| verdadeiro | falso |

**Case-insensitive:** `TRUE`, `True`, `true` são equivalentes.

## 🚨 Tratamento de Erros

### Estratégia de Coleta de Erros

Ambos os parsers coletam TODOS os erros antes de falhar:

```typescript
const errors: string[] = [];

for (let index = 0; index < rows.length; index++) {
  try {
    const question = mapRowToQuestion(row, lineNumber);
    questions.push(question);
  } catch (error) {
    errors.push(`Linha ${lineNumber}: ${error.message}`);
  }
}

// Só lança exceção se houver erros
if (errors.length > 0) {
  throw new BadRequestException({
    message: `${errors.length} erro(s) encontrado(s)`,
    errors,              // Array com todos os erros
    successCount: questions.length,  // Quantas parseadas com sucesso
    totalRows: rows.length,          // Total de linhas processadas
  });
}
```

### Formato de Resposta de Erro

```json
{
  "statusCode": 400,
  "message": "3 erro(s) encontrado(s) ao processar Excel",
  "error": "Bad Request",
  "errors": [
    "Linha 5: Campo \"type\" é obrigatório",
    "Linha 8: Tipo inválido: \"MULTIPLA_ESC\". Use: NUMERICA, MULTIPLA_ESCOLHA, ...",
    "Linha 12: Múltipla escolha deve ter pelo menos 2 opções"
  ],
  "successCount": 7,
  "totalRows": 10
}
```

### Mensagens de Erro Detalhadas

Todas as mensagens incluem:
1. **Número da linha** onde ocorreu o erro
2. **Campo específico** que causou o problema
3. **Valor recebido** (quando aplicável)
4. **Valores válidos** ou **formato esperado**

Exemplos:
```
❌ "Campo(s) obrigatório(s) ausente(s): text, type"
❌ "Texto da questão deve ter no mínimo 10 caracteres"
❌ "minValue deve ser numérico, recebido: \"abc\""
❌ "Tipo inválido: \"multipla_esc\". Valores válidos: NUMERICA, MULTIPLA_ESCOLHA, ..."
❌ "likertMin (5) não pode ser maior que likertMax (3)"
❌ "Múltipla escolha deve ter pelo menos 2 opções"
❌ "Opções duplicadas detectadas em \"options.choices\""
```

## ⚡ Otimizações e Performance

### Excel Parser
- **Leitura em memória:** Adequado para arquivos até 10MB
- **Conversão direta para JSON:** Usa `XLSX.utils.sheet_to_json()`
- **Sem streams:** Processo síncrono, rápido para arquivos pequenos/médios
- **Limite recomendado:** ~5000 linhas (depende da complexidade)

### CSV Parser
- **Streaming:** Processa linha por linha
- **Memory-efficient:** Não carrega arquivo inteiro na memória
- **Adequado para:** Arquivos grandes (10MB+, milhares de linhas)
- **Processamento paralelo:** Não implementado (considera-se para v2)

### Validação de Upload
```typescript
// Executada ANTES do parsing
validateFileUpload(file, ['xlsx', 'xls'], 10);

// Previne processamento desnecessário
✅ Arquivo vazio → Rejeita imediatamente
✅ Extensão errada → Rejeita sem ler conteúdo
✅ Tamanho excessivo → Rejeita sem processar
```

### Dicas de Performance

1. **Use CSV para arquivos grandes** (>5000 linhas)
2. **Remova linhas vazias** antes do upload
3. **Evite formatação complexa** no Excel
4. **Use formatos simples** para `options` (pipe-separated)
5. **Valide dados localmente** antes de importar em produção

## 🎯 Casos de Uso Avançados

### 1. Importação em Lote com Validação Prévia

```bash
# 1. Baixar template
curl -X GET http://localhost:3000/questions/templates/excel \
  -H "Authorization: Bearer $TOKEN" \
  -o template.xlsx

# 2. Preencher com dados

# 3. Testar em ambiente de dev/staging primeiro
curl -X POST http://localhost:3000/questions/upload/excel \
  -H "Authorization: Bearer $DEV_TOKEN" \
  -F "file=@questoes.xlsx"

# 4. Analisar resposta de erros

# 5. Corrigir e reimportar

# 6. Quando 100% sucesso, importar em produção
```

### 2. Migração de Dados Legados

Se você tem questões em outro formato/sistema:

```typescript
// Script de conversão (executar localmente)
const oldQuestions = await loadFromOldSystem();

const convertedRows = oldQuestions.map(q => ({
  text: q.pergunta,
  type: mapOldTypeToNew(q.tipo),
  category: inferCategory(q),
  scope: 'LOCAL',
  isRequired: q.obrigatoria ? 'true' : 'false',
  // ... outros campos
}));

// Gerar Excel
const worksheet = XLSX.utils.json_to_sheet(convertedRows);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Questões');
XLSX.writeFile(workbook, 'migracao.xlsx');

// Importar via API
```

### 3. Validação de Dados com Script

Antes de importar, você pode validar localmente:

```typescript
import { FileParserService } from './file-parser.service';
import * as fs from 'fs';

const parser = new FileParserService();
const buffer = fs.readFileSync('questoes.xlsx');

try {
  const questions = await parser.parseExcel(buffer);
  console.log(`✅ ${questions.length} questões válidas`);
  
  // Análise estatística
  const byType = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {});
  
  console.log('Distribuição por tipo:', byType);
} catch (error) {
  console.error('❌ Erros encontrados:', error.response.errors);
}
```

### 4. Importação Incremental com Origin Tracking

```bash
# Importação de diferentes fontes com origem específica
curl -X POST http://localhost:3000/questions/upload/excel \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@pesquisa_clima.xlsx" \
  -F "defaultOrigin=PESQUISA_CLIMA_2025" \
  -F "researchGroupId=uuid-do-grupo"

curl -X POST http://localhost:3000/questions/upload/csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@questionario_demografico.csv" \
  -F "defaultOrigin=QUESTIONARIO_BASE" \
  -F "researchGroupId=uuid-do-grupo"

# Depois, consultar por origem
curl -X GET "http://localhost:3000/questions?origin=PESQUISA_CLIMA_2025" \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Troubleshooting Avançado

### Problema: "Arquivo Excel não contém planilhas"

**Causa:** Arquivo corrompido ou formato não suportado.

**Solução:**
1. Abra o arquivo no Excel/LibreOffice
2. Salve novamente como `.xlsx` (não `.xls`)
3. Verifique se há pelo menos uma planilha
4. Remova macros e formatação complexa

### Problema: "Detectado encoding Latin1" mas caracteres errados

**Causa:** Arquivo está em outro encoding (ex: Windows-1252, ISO-8859-1).

**Solução:**
```bash
# Converter para UTF-8 antes do upload
iconv -f WINDOWS-1252 -t UTF-8 arquivo.csv > arquivo_utf8.csv
```

### Problema: CSV com delimitador não detectado

**Causa:** Delimitador incomum (tab, pipe) ou primeira linha sem dados.

**Solução:**
1. Converter para formato padrão (vírgula ou ponto-e-vírgula)
2. Garantir que primeira linha tem cabeçalhos
3. Se necessário, modificar o parser para aceitar outros delimitadores

### Problema: "Options.choices deve ser array" mesmo com JSON correto

**Causa:** JSON mal formatado ou aspas simples ao invés de duplas.

**Solução:**
```javascript
// ❌ Errado
'choices':['A','B']

// ✅ Correto
"choices":["A","B"]

// ✅ Alternativa: use pipe-separated
A|B|C
```

### Problema: Importação lenta para arquivos grandes

**Solução:**
1. Use CSV ao invés de Excel
2. Divida em múltiplos arquivos menores (~1000 linhas cada)
3. Importe de forma assíncrona/background (feature futura)

### Problema: "Linha X vazia, ignorando" mas linha não está vazia

**Causa:** Linha contém apenas espaços ou células formatadas mas vazias.

**Solução:**
1. Selecione todas as células da linha
2. Delete a linha inteira (não apenas o conteúdo)
3. Ou use "Ir para Especial" > "Células em branco" > Deletar

### Problema: Número de linhas processadas diferente do Excel

**Causa:** Linhas vazias ou formatação invisível.

**Verificação:**
```typescript
// O parser conta apenas linhas com dados válidos
// Linhas completamente vazias são ignoradas automaticamente
```

**Solução:**
1. Limpe formatação desnecessária
2. Use "Ctrl+End" no Excel para ver última célula usada
3. Delete linhas extras após seus dados

## 📊 Logs e Debugging

### Logs do Parser

O `FileParserService` usa `Logger` do NestJS:

```typescript
// Logs informativos
this.logger.log('Parseando arquivo Excel');
this.logger.log(`${rawData.length} linhas encontradas`);
this.logger.log(`${questions.length} questões parseadas com sucesso`);

// Logs de debug (não aparecem em produção)
this.logger.debug(`Linha ${lineNumber} vazia, ignorando`);

// Logs de warning
this.logger.warn(`Mimetype inesperado: ${file.mimetype}`);

// Logs de erro
this.logger.error(`Erro na linha ${lineNumber}: ${error.message}`);
```

### Ativar Debug Logs

```bash
# Em desenvolvimento
LOG_LEVEL=debug npm run start:dev

# Ou via variável de ambiente
export LOG_LEVEL=debug
```

### Monitorar Imports

```sql
-- Ver questões importadas recentemente
SELECT 
  origin,
  COUNT(*) as total,
  MIN("createdAt") as primeira_import,
  MAX("createdAt") as ultima_import
FROM "Question"
WHERE origin LIKE '%IMPORT%'
GROUP BY origin
ORDER BY ultima_import DESC;

-- Ver erros de import (se houver tabela de logs)
SELECT * FROM import_logs 
WHERE status = 'ERROR' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

## 🔮 Roadmap de Melhorias

Funcionalidades planejadas para versões futuras:

1. **Validação Assíncrona:** Upload e processamento em background
2. **Preview:** Visualizar primeiras linhas antes de importar
3. **Mapeamento de Colunas:** Interface para mapear colunas customizadas
4. **Templates Personalizados:** Criar templates específicos por projeto
5. **Versionamento:** Rastrear alterações em questões importadas
6. **Rollback:** Desfazer importações
7. **Importação Parcial:** Importar apenas linhas selecionadas
8. **Mais Formatos:** JSON, XML, Google Sheets API

## 📚 Referências

- [SheetJS (xlsx) Documentation](https://docs.sheetjs.com/)
- [csv-parser npm](https://www.npmjs.com/package/csv-parser)
- [Multer Documentation](https://github.com/expressjs/multer)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)

---

**Atualizado:** 04/12/2025  
**Versão do Parser:** 1.0.0
