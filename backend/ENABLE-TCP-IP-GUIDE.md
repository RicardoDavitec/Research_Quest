# Guia: Habilitar TCP/IP no SQL Server Express

## ✅ Progresso Atual
- [x] Autenticação SQL habilitada (modo misto)
- [x] Usuário SQL criado: `campouser` / `Campo@2024!`
- [ ] **TCP/IP habilitado (NECESSÁRIO)**

## 🔧 Como Habilitar TCP/IP

### Opção 1: Usando SQL Server Configuration Manager (RECOMENDADO)

1. **Abra o SQL Server Configuration Manager**
   - Pressione `Win + R`
   - Digite: `SQLServerManager17.msc` (para SQL Server 2022)
   - Pressione Enter

2. **Navegue até Protocolos**
   - No painel esquerdo: `SQL Server Network Configuration`
   - Clique em: `Protocols for SQLEXPRESS`

3. **Habilite TCP/IP**
   - Clique com botão direito em `TCP/IP`
   - Selecione `Enable`
   - Clique em `OK`

4. **Configure a Porta 1433**
   - Clique duas vezes em `TCP/IP`
   - Vá para a aba `IP Addresses`
   - Role até `IPAll`
   - Limpe `TCP Dynamic Ports` (deixe vazio)
   - Em `TCP Port`, digite: `1433`
   - Clique em `OK`

5. **Reinicie o Serviço SQL Server**
   ```powershell
   Restart-Service -Name "MSSQL$SQLEXPRESS" -Force
   ```

### Opção 2: Via PowerShell (Requer Administrador)

Execute este comando como Administrador:

```powershell
# Importar SQL Server PowerShell module
Import-Module "sqlps" -DisableNameChecking

# Habilitar TCP/IP
$wmi = new-object ('Microsoft.SqlServer.Management.Smo.Wmi.ManagedComputer')
$uri = "ManagedComputer[@Name='$env:COMPUTERNAME']/ServerInstance[@Name='SQLEXPRESS']/ServerProtocol[@Name='Tcp']"
$Tcp = $wmi.GetSmoObject($uri)
$Tcp.IsEnabled = $true
$Tcp.Alter()

# Configurar porta 1433
$uri = "ManagedComputer[@Name='$env:COMPUTERNAME']/ServerInstance[@Name='SQLEXPRESS']/ServerProtocol[@Name='Tcp']/IPAddress[@Name='IPAll']"
$ipall = $wmi.GetSmoObject($uri)
$ipall.IPAddressProperties["TcpDynamicPorts"].Value = ""
$ipall.IPAddressProperties["TcpPort"].Value = "1433"
$ipall.Alter()

# Reiniciar serviço
Restart-Service -Name "MSSQL$SQLEXPRESS" -Force

Write-Host "✅ TCP/IP habilitado na porta 1433!" -ForegroundColor Green
```

## 📝 Após Habilitar TCP/IP

Execute para testar a conexão:
```powershell
node test-sql-connection.js
```

Você deve ver:
```
✅ Conectado com sucesso!
Banco de dados: campo_research_db
```

## 🔄 Próximos Passos Após TCP/IP Funcionar

1. Executar migração do Prisma:
   ```powershell
   npx prisma migrate dev --name init
   ```

2. Ou criar tabelas manualmente:
   ```powershell
   Invoke-Sqlcmd -ServerInstance "localhost,1433" -Database "campo_research_db" -Username "campouser" -Password "Campo@2024!" -InputFile "create-tables.sql" -TrustServerCertificate
   ```

3. Iniciar o backend:
   ```powershell
   npm run start:dev
   ```

## 🔍 Verificar se TCP/IP Está Habilitado

```powershell
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp\IPAll"
```

Deve mostrar: `TcpPort: 1433` e `TcpDynamicPorts` vazio
