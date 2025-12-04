# Refresh Token - Guia de Implementação

## Visão Geral

O sistema implementa autenticação baseada em **Access Token** (JWT de curta duração) e **Refresh Token** (token de longa duração) para maior segurança e melhor experiência do usuário.

### Características

- **Access Token:** JWT válido por 15 minutos
- **Refresh Token:** Token único armazenado no banco, válido por 30 dias
- **Rotação de Tokens:** Cada renovação gera novo refresh token e revoga o anterior
- **Revogação:** Suporte a logout individual e logout de todos os dispositivos

## Fluxo de Autenticação

### 1. Login (SignIn)

**Endpoint:** `POST /auth/signin`

```json
{
  "email": "usuario@example.com",
  "password": "Senha@123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Nome Usuário",
    "cpf": "123.456.789-00",
    "phone": "(11) 98765-4321"
  },
  "researcher": {
    "id": "uuid",
    "primaryInstitution": { ... },
    "academicTitle": "Doutor"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...hex-string"
}
```

### 2. Uso do Access Token

Incluir o access token no header de todas as requisições autenticadas:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Renovação de Tokens (quando access token expira)

**Endpoint:** `POST /auth/refresh`

```json
{
  "refreshToken": "a1b2c3d4e5f6...hex-string"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "x9y8z7w6v5u4...novo-hex-string"
}
```

⚠️ **Importante:** 
- O refresh token antigo é **revogado automaticamente**
- Salve o novo refresh token retornado
- Use o novo access token nas próximas requisições

### 4. Logout

#### Logout Individual

**Endpoint:** `POST /auth/logout`

```json
{
  "refreshToken": "a1b2c3d4e5f6...hex-string"
}
```

Revoga apenas o refresh token fornecido (logout de um dispositivo).

#### Logout de Todos os Dispositivos

**Endpoint:** `POST /auth/logout-all`

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Revoga todos os refresh tokens do usuário (logout de todos os dispositivos).

## Implementação no Frontend

### Armazenamento de Tokens

```javascript
// Armazenar tokens após login
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);

// Recuperar tokens
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');
```

⚠️ **Segurança:** 
- Considere usar `httpOnly cookies` para maior segurança em produção
- Nunca exponha tokens em URLs ou logs

### Interceptor de Requisições (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Adicionar access token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Renovar token automaticamente quando expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se erro 401 e ainda não tentou renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Renovar tokens
        const { data } = await axios.post('http://localhost:3000/auth/refresh', {
          refreshToken,
        });

        // Salvar novos tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Repetir requisição original com novo token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token inválido - redirecionar para login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Função de Logout

```javascript
async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    // Limpar tokens localmente
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirecionar para login
    window.location.href = '/login';
  }
}

async function logoutAll() {
  try {
    await api.post('/auth/logout-all');
  } catch (error) {
    console.error('Erro ao fazer logout de todos dispositivos:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
}
```

## Estrutura do Banco de Dados

### Tabela: `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_revoked BOOLEAN DEFAULT FALSE,
  device_info TEXT,
  ip_address TEXT
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

### Campos

- `token`: String hexadecimal de 128 caracteres (64 bytes)
- `expires_at`: Data de expiração (30 dias após criação)
- `is_revoked`: Flag de revogação (logout)
- `device_info`: Informações opcionais do dispositivo
- `ip_address`: IP do cliente (opcional)

## Segurança

### Boas Práticas Implementadas

✅ **Access Token de Curta Duração:** 15 minutos reduz janela de ataque  
✅ **Refresh Token Único:** Tokens criptograficamente seguros (crypto.randomBytes)  
✅ **Rotação Automática:** Novo refresh token a cada renovação  
✅ **Revogação Imediata:** Logout invalida tokens instantaneamente  
✅ **Armazenamento Seguro:** Tokens no banco com índices otimizados  
✅ **Limpeza Automática:** Método para remover tokens expirados  

### Recomendações Adicionais

1. **Rate Limiting:** Limite tentativas de renovação de token
2. **HTTPS Obrigatório:** Nunca envie tokens por HTTP
3. **HttpOnly Cookies:** Considere usar cookies em vez de localStorage
4. **Monitoramento:** Log de tentativas de uso de tokens inválidos
5. **IP Tracking:** Valide mudanças suspeitas de IP

## Manutenção

### Limpeza de Tokens Expirados

Execute periodicamente (cron job ou task scheduler):

```typescript
// Executar diariamente
await authService.cleanupExpiredTokens();
```

### Monitoramento

Queries úteis para administradores:

```sql
-- Contar tokens ativos por usuário
SELECT user_id, COUNT(*) as active_tokens
FROM refresh_tokens
WHERE is_revoked = FALSE AND expires_at > NOW()
GROUP BY user_id;

-- Tokens expirados mas não limpos
SELECT COUNT(*) as expired_tokens
FROM refresh_tokens
WHERE expires_at < NOW();

-- Tokens revogados (histórico de logouts)
SELECT COUNT(*) as revoked_tokens
FROM refresh_tokens
WHERE is_revoked = TRUE;
```

## Tratamento de Erros

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Refresh token inválido` | Token não existe no banco | Fazer login novamente |
| `Refresh token foi revogado` | Usuário fez logout | Fazer login novamente |
| `Refresh token expirado` | Token passou de 30 dias | Fazer login novamente |
| `Access token expirado` | Token passou de 15 minutos | Renovar com refresh token |

### Códigos HTTP

- `200 OK`: Renovação bem-sucedida
- `401 Unauthorized`: Token inválido, revogado ou expirado
- `400 Bad Request`: Dados inválidos na requisição

## Exemplo Completo (React)

```typescript
import { useState, useEffect } from 'react';
import api from './api'; // Axios configurado com interceptors

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadProfile();
    }
  }, []);

  async function handleLogin(email: string, password: string) {
    try {
      const { data } = await api.post('/auth/signin', { email, password });
      
      // Salvar tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      setUser(data.user);
    } catch (error) {
      console.error('Erro no login:', error);
    }
  }

  async function loadProfile() {
    try {
      const { data } = await api.get('/auth/profile');
      setUser(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      handleLogout();
    }
  }

  async function handleLogout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>Bem-vindo, {user.name}!</h1>
          <button onClick={handleLogout}>Sair</button>
        </div>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  );
}
```

## Migration Aplicada

```sql
-- Migration: 20251204101357_add_refresh_token_table
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

ALTER TABLE "refresh_tokens" 
ADD CONSTRAINT "refresh_tokens_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Próximos Passos

- [ ] Implementar rate limiting para endpoint `/auth/refresh`
- [ ] Adicionar device fingerprinting
- [ ] Implementar notificações de login em novos dispositivos
- [ ] Dashboard de sessões ativas para o usuário
- [ ] Two-factor authentication (2FA)
