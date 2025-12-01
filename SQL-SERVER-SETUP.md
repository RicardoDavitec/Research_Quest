# Guia Rapido - Instalacao do SQL Server Express

## Problema Atual
O backend precisa do SQL Server para funcionar, mas ele nao esta instalado no sistema.

## Solucao 1: Instalar SQL Server Express 2022 (RECOMENDADO)

### Passo 1: Download
1. Acesse: https://www.microsoft.com/pt-br/sql-server/sql-server-downloads
2. Clique em "Baixar agora" na secao **Express** (gratuito)
3. Salve o arquivo `SQL2022-SSEI-Expr.exe`

### Passo 2: Instalacao
1. Execute o arquivo baixado
2. Escolha **"Basico"** (Basic)
3. Aceite os termos de licenca
4. Aguarde a instalacao (5-10 minutos)
5. Anote o nome da instancia (geralmente `SQLEXPRESS`)

### Passo 3: Configurar Conexao
Apos instalar, atualize o arquivo `backend\.env`:

```env
DB_HOST=localhost\SQLEXPRESS
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Password
```

**IMPORTANTE:** A senha do `sa` sera definida durante a instalacao!

### Passo 4: Criar o Banco de Dados
Execute no PowerShell:
```powershell
cd D:\Research_Quest\backend
sqlcmd -S localhost\SQLEXPRESS -U sa -P "SuaSenha" -Q "CREATE DATABASE campo_research_db"
```

### Passo 5: Reiniciar o Backend
Feche a janela do backend e execute novamente:
```powershell
cd D:\Research_Quest
.\start-dev.bat
```

---

## Solucao 2: Usar Docker com SQL Server (Alternativa)

Se voce tem Docker instalado:

```powershell
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Password" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

Depois atualize o `.env`:
```env
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Password
DB_DATABASE=campo_research_db
```

Criar banco:
```powershell
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password" -Q "CREATE DATABASE campo_research_db"
```

---

## Solucao 3: Configuracao SQLite Temporaria (Desenvolvimento)

Para testar rapidamente sem SQL Server, podemos configurar SQLite.

### Instalar dependencia
```powershell
cd D:\Research_Quest\backend
npm install sqlite3 better-sqlite3
```

### Atualizar data-source.ts
Modifique `backend/src/database/data-source.ts` para suportar SQLite quando SQL Server nao estiver disponivel.

---

## Verificacao da Instalacao

Apos instalar o SQL Server, verifique:

```powershell
# Verificar servico
Get-Service -Name "MSSQL*"

# Testar conexao
sqlcmd -S localhost\SQLEXPRESS -U sa -P "SuaSenha" -Q "SELECT @@VERSION"
```

---

## Proximos Passos Apos SQL Server Instalado

1. Parar os servidores:
   ```powershell
   .\stop-dev.bat
   ```

2. Atualizar `.env` com credenciais corretas

3. Reiniciar:
   ```powershell
   .\start-dev.bat
   ```

4. O backend criara as tabelas automaticamente (synchronize: true)

5. Popular dados de teste (opcional):
   ```powershell
   cd backend
   node ../scripts/seed-hierarchical-data.js
   ```

---

## Usuarios de Teste (Apos Popular Banco)

Consulte `scripts/seed-hierarchical-data.js` para usuarios de teste disponiveis.

Senha padrao para todos: **senha123**

---

## Problemas Comuns

### "Login failed for user 'sa'"
- Verifique a senha no `.env`
- Certifique-se que Mixed Mode Authentication esta habilitado

### "Cannot open database"
- Execute: `sqlcmd -S localhost\SQLEXPRESS -U sa -P "SuaSenha" -Q "CREATE DATABASE campo_research_db"`

### "Service not found"
- Verifique: `Get-Service -Name "*SQL*"`
- Inicie: `Start-Service -Name "MSSQL$SQLEXPRESS"`

---

## Contato

Para mais ajuda, verifique os logs em:
- Backend: Janela PowerShell do backend
- SQL Server: `C:\Program Files\Microsoft SQL Server\160\Setup Bootstrap\Log\`
