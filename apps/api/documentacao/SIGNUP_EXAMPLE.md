# SignUp API - Exemplo de Uso

## Endpoint: POST /auth/signup

### Descrição
Registra um novo usuário no sistema e cria automaticamente seu perfil de pesquisador. A operação é realizada em uma transação atômica para garantir consistência dos dados.

### Validações Implementadas

#### Senha
- Mínimo 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número
- Pelo menos um caractere especial (@$!%*?&#)

#### CPF
- Formato: 000.000.000-00
- Verifica duplicidade no sistema

#### Email
- Formato válido de email
- Verifica duplicidade no sistema
- Convertido para lowercase

#### Telefone (opcional)
- Formato: (00) 00000-0000 ou (00) 0000-0000

#### Lattes (opcional)
- Exatamente 16 dígitos

#### ORCID (opcional)
- Formato: 0000-0000-0000-0000

### Request Body

```json
{
  "email": "joao.silva@example.com",
  "password": "Senha@Forte123",
  "cpf": "123.456.789-00",
  "name": "João Silva Santos",
  "phone": "(11) 98765-4321",
  "role": "PESQUISADOR",
  "primaryInstitutionId": "uuid-da-instituicao-principal",
  "secondaryInstitutionId": "uuid-da-instituicao-secundaria",
  "academicTitle": "Doutor em Ciências da Saúde",
  "lattesNumber": "1234567890123456",
  "orcidId": "0000-0002-1234-5678",
  "specialization": "Epidemiologia, Saúde Pública, Pesquisa Clínica"
}
```

### Response (Success - 201)

```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "joao.silva@example.com",
    "name": "João Silva Santos",
    "cpf": "123.456.789-00",
    "phone": "(11) 98765-4321",
    "createdAt": "2024-12-04T12:00:00.000Z"
  },
  "researcher": {
    "id": "uuid-do-pesquisador",
    "primaryInstitution": {
      "id": "uuid-da-instituicao",
      "name": "Universidade Federal de São Paulo",
      "type": "ACADEMICA"
    },
    "secondaryInstitution": null,
    "academicTitle": "Doutor em Ciências da Saúde",
    "lattesNumber": "1234567890123456",
    "orcidId": "0000-0002-1234-5678",
    "specialization": "Epidemiologia, Saúde Pública, Pesquisa Clínica"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

#### 409 Conflict - Usuário já existe
```json
{
  "statusCode": 409,
  "message": "Já existe um usuário cadastrado com este email ou CPF",
  "error": "Conflict"
}
```

#### 400 Bad Request - Instituição não encontrada
```json
{
  "statusCode": 400,
  "message": "Instituição principal não encontrada",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Validação falhou
```json
{
  "statusCode": 400,
  "message": [
    "Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial",
    "CPF deve estar no formato 000.000.000-00"
  ],
  "error": "Bad Request"
}
```

## Segurança

### Hash de Senha
- Algoritmo: bcrypt
- Rounds: 12 (recomendado para alta segurança)
- Senha nunca é armazenada em texto plano

### JWT Token
- Expiração: 7 dias
- Payload inclui: userId, email, role
- Deve ser enviado no header `Authorization: Bearer <token>`

## Exemplo de Uso (cURL)

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@example.com",
    "password": "Senha@Forte123",
    "cpf": "123.456.789-00",
    "name": "João Silva Santos",
    "phone": "(11) 98765-4321",
    "role": "PESQUISADOR",
    "primaryInstitutionId": "uuid-da-instituicao",
    "academicTitle": "Doutor em Ciências da Saúde",
    "lattesNumber": "1234567890123456",
    "orcidId": "0000-0002-1234-5678",
    "specialization": "Epidemiologia, Saúde Pública"
  }'
```

## Exemplo de Uso (JavaScript/Fetch)

```javascript
const response = await fetch('http://localhost:3000/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'joao.silva@example.com',
    password: 'Senha@Forte123',
    cpf: '123.456.789-00',
    name: 'João Silva Santos',
    phone: '(11) 98765-4321',
    role: 'PESQUISADOR',
    primaryInstitutionId: 'uuid-da-instituicao',
    academicTitle: 'Doutor em Ciências da Saúde',
    lattesNumber: '1234567890123456',
    orcidId: '0000-0002-1234-5678',
    specialization: 'Epidemiologia, Saúde Pública',
  }),
});

const data = await response.json();
console.log('Token:', data.token);

// Usar token em requisições subsequentes
const profileResponse = await fetch('http://localhost:3000/auth/profile', {
  headers: {
    'Authorization': `Bearer ${data.token}`,
  },
});
```

## Próximos Passos

Após o cadastro bem-sucedido:
1. Salvar o token JWT no localStorage ou sessionStorage
2. Incluir o token no header de todas as requisições autenticadas
3. Redirecionar o usuário para o dashboard
4. (Futuro) Enviar email de confirmação de cadastro

## Notas

- A operação é realizada em uma transação: se qualquer parte falhar, todo o cadastro é revertido
- O CPF é armazenado sem formatação no banco (apenas números)
- O email é convertido para lowercase antes de armazenar
- Espaços extras são removidos dos campos de texto
- (Futuro) Notificação de boas-vindas será criada automaticamente
