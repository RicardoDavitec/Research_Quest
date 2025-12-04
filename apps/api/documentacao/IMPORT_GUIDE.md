# Importação de Questões via Arquivo

Este módulo permite importar questões em lote através de arquivos Excel (.xlsx, .xls) ou CSV (.csv).

## 📥 Como Usar

### 1. Download do Template

Antes de criar seu arquivo, baixe um template de exemplo:

**Excel:**
```http
GET http://localhost:3000/questions/templates/excel
Authorization: Bearer SEU_TOKEN
```

**CSV:**
```http
GET http://localhost:3000/questions/templates/csv
Authorization: Bearer SEU_TOKEN
```

### 2. Preencher o Arquivo

#### Colunas Obrigatórias

- **text**: Texto da questão (obrigatório)
- **type**: Tipo da questão (obrigatório)
- **category**: Categoria da questão (obrigatório)
- **scope**: Escopo da questão (obrigatório)

#### Colunas Opcionais

- **isRequired**: Se a questão é obrigatória (true/false)
- **minValue**: Valor mínimo (para questões numéricas)
- **maxValue**: Valor máximo (para questões numéricas)
- **helpText**: Texto de ajuda para o respondente
- **options**: Opções de resposta (JSON) - para múltipla escolha
- **likertMin**: Valor mínimo da escala (para Likert)
- **likertMax**: Valor máximo da escala (para Likert)
- **likertLabels**: Labels da escala (JSON) - para Likert
- **objective**: Objetivo da questão
- **targetAudience**: Público-alvo
- **origin**: Origem da questão

### 3. Valores Válidos

#### Types (Tipos)
- `MULTIPLA_ESCOLHA`
- `ABERTA`
- `ESCALA_LIKERT`
- `SIM_NAO`
- `NUMERICA`
- `DATA`
- `HORA`

#### Categories (Categorias)
- `DEMOGRAFICA`
- `CLINICA`
- `COMPORTAMENTAL`
- `SOCIAL`
- `ECONOMICA`
- `PSICOLOGICA`

#### Scopes (Escopos)
- `LOCAL`
- `INSTITUCIONAL`
- `MUNICIPAL`
- `ESTADUAL`
- `REGIONAL`
- `NACIONAL`
- `INTERNACIONAL`

## 📋 Exemplos de Preenchimento

### Exemplo 1: Questão Numérica

```
text: Qual é a sua idade?
type: NUMERICA
category: DEMOGRAFICA
scope: NACIONAL
isRequired: true
minValue: 0
maxValue: 120
helpText: Informe sua idade em anos completos
objective: Coletar dados demográficos dos participantes
targetAudience: Todos os participantes
origin: MANUAL
```

### Exemplo 2: Múltipla Escolha

```
text: Qual o seu nível de escolaridade?
type: MULTIPLA_ESCOLHA
category: DEMOGRAFICA
scope: NACIONAL
isRequired: true
options: {"choices":["Fundamental","Médio","Superior","Pós-graduação"]}
objective: Identificar perfil educacional
```

### Exemplo 3: Escala Likert

```
text: Como você avalia sua qualidade de vida?
type: ESCALA_LIKERT
category: PSICOLOGICA
scope: INTERNACIONAL
isRequired: true
likertMin: 1
likertMax: 5
likertLabels: {"1":"Muito ruim","2":"Ruim","3":"Regular","4":"Boa","5":"Muito boa"}
objective: Avaliar percepção de qualidade de vida
```

### Exemplo 4: Sim/Não

```
text: Você tem alguma doença crônica?
type: SIM_NAO
category: CLINICA
scope: NACIONAL
isRequired: true
helpText: Considere diabetes, hipertensão, asma, etc.
objective: Identificar condições de saúde pré-existentes
```

### Exemplo 5: Questão Aberta

```
text: Descreva seus principais sintomas
type: ABERTA
category: CLINICA
scope: LOCAL
isRequired: false
helpText: Descreva em detalhes os sintomas que você apresenta
objective: Coletar relatos detalhados de sintomas
```

### Exemplo 6: Data

```
text: Data da última consulta médica
type: DATA
category: CLINICA
scope: LOCAL
isRequired: false
objective: Registrar histórico de consultas
```

## 🚀 Fazer Upload

### Via Thunder Client (VS Code)

1. Abra Thunder Client
2. Método: **POST**
3. URL: `http://localhost:3000/questions/upload/excel` ou `/upload/csv`
4. Aba **Body** > Selecione **Form**
5. Adicione campos:
   - `file` (tipo File): Selecione seu arquivo
   - `defaultOrigin` (tipo Text): Ex: "EXCEL_IMPORT" (opcional)
   - `researchGroupId` (tipo Text): UUID do grupo (opcional)
6. Aba **Headers**: Adicione `Authorization: Bearer SEU_TOKEN`
7. Clique **Send**

### Via cURL

**Excel:**
```bash
curl -X POST http://localhost:3000/questions/upload/excel \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@caminho/para/seu/arquivo.xlsx" \
  -F "defaultOrigin=EXCEL_IMPORT" \
  -F "researchGroupId=uuid-do-grupo"
```

**CSV:**
```bash
curl -X POST http://localhost:3000/questions/upload/csv \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@caminho/para/seu/arquivo.csv" \
  -F "defaultOrigin=CSV_IMPORT"
```

### Via Postman

1. Método: **POST**
2. URL: `http://localhost:3000/questions/upload/excel`
3. Aba **Authorization**: Bearer Token > Cole seu token
4. Aba **Body**: 
   - Selecione **form-data**
   - Adicione key `file` (tipo File) e selecione arquivo
   - Adicione key `defaultOrigin` (tipo Text) com valor desejado
   - Adicione key `researchGroupId` (tipo Text) se quiser vincular a grupo
5. Clique **Send**

## 📊 Resposta do Upload

```json
{
  "message": "Importação concluída",
  "fileName": "questoes.xlsx",
  "success": [
    {
      "index": 0,
      "id": "uuid-da-questao",
      "text": "Qual é a sua idade?"
    },
    {
      "index": 1,
      "id": "uuid-da-questao",
      "text": "Qual o seu nível de escolaridade?"
    }
  ],
  "failed": [],
  "total": 2
}
```

Se houver erros:

```json
{
  "message": "Importação concluída",
  "fileName": "questoes.xlsx",
  "success": [...],
  "failed": [
    {
      "index": 5,
      "data": { "text": "..." },
      "error": "Campo 'type' é obrigatório"
    }
  ],
  "total": 10
}
```

## ⚠️ Erros Comuns

### 1. "Campo 'text' é obrigatório"
- Certifique-se de que todas as linhas têm texto da questão

### 2. "Tipo de questão inválido"
- Verifique se o tipo está escrito corretamente
- Use valores exatos: `NUMERICA`, `MULTIPLA_ESCOLHA`, etc.

### 3. "Campo 'options' deve ser JSON válido"
- Para múltipla escolha, use: `{"choices":["Opção 1","Opção 2"]}`
- Certifique-se de usar aspas duplas no JSON

### 4. "Questões Likert requerem likertMin e likertMax"
- Escala Likert precisa de valores mínimo e máximo
- Exemplo: likertMin=1, likertMax=5

### 5. "minValue não pode ser maior que maxValue"
- Para questões numéricas, verifique os valores

### 6. "likertMin deve ser menor que likertMax"
- Valores da escala Likert devem ser crescentes

## 💡 Dicas

1. **Use o template**: Sempre comece com o template baixado
2. **Teste com poucas linhas**: Importe 2-3 questões primeiro para testar
3. **Validação de JSON**: Use um validador JSON online para campos `options` e `likertLabels`
4. **Encoding**: Salve arquivos CSV em UTF-8 para evitar problemas com acentos
5. **Excel vs CSV**: Excel é mais fácil para editar, CSV é melhor para integração com outros sistemas

## 📚 Campos JSON Complexos

### options (Múltipla Escolha)
```json
{
  "choices": [
    "Opção 1",
    "Opção 2",
    "Opção 3"
  ],
  "allowMultiple": false,
  "allowOther": true
}
```

### likertLabels (Escala Likert)
```json
{
  "1": "Discordo totalmente",
  "2": "Discordo",
  "3": "Neutro",
  "4": "Concordo",
  "5": "Concordo totalmente"
}
```

## 🔒 Permissões

Podem fazer upload:
- PESQUISADOR
- COORDENADOR_PROJETO
- COORDENADOR_GRUPO
- DOCENTE
- ORIENTADOR

## 📝 Notas

- Limite de tamanho de arquivo: 10MB (configurável)
- Formatos aceitos: .xlsx, .xls, .csv
- Todas as questões importadas são vinculadas ao usuário que fez o upload
- Use `defaultOrigin` para identificar a fonte das questões
- Use `researchGroupId` para vincular todas as questões a um grupo específico
