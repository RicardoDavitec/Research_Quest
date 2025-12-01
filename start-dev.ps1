# Script de Inicializacao do Research Quest
# Verifica dependencias, limpa processos e inicia backend e frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Research Quest - Inicializacao Dev" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Atualizar PATH do sistema
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Funcao para verificar se um comando existe
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Funcao para matar processos em portas especificas
function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-Host "Verificando porta $Port..." -ForegroundColor Yellow
    
    $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
    
    if ($connections) {
        foreach ($connection in $connections) {
            $parts = $connection -split '\s+' | Where-Object { $_ -ne '' }
            $pid = $parts[-1]
            
            if ($pid -match '^\d+$') {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  Encerrando processo '$($process.ProcessName)' (PID: $pid) na porta $Port" -ForegroundColor Red
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Milliseconds 500
                    }
                }
                catch {
                    Write-Host "  Nao foi possivel encerrar processo PID: $pid" -ForegroundColor DarkRed
                }
            }
        }
    }
    else {
        Write-Host "  Porta $Port esta livre" -ForegroundColor Green
    }
}

# Funcao para matar processos Node.js
function Stop-NodeProcesses {
    Write-Host "`nEncerrando todos os processos Node.js..." -ForegroundColor Yellow
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        foreach ($proc in $nodeProcesses) {
            Write-Host "  Encerrando Node.js (PID: $($proc.Id))" -ForegroundColor Red
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
    else {
        Write-Host "  Nenhum processo Node.js em execucao" -ForegroundColor Green
    }
}

# 1. VERIFICACAO DE DEPENDENCIAS
Write-Host "`n[1/6] Verificando dependencias do sistema..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$missingTools = @()

# Verificar Node.js
Write-Host "`nVerificando Node.js..." -ForegroundColor White
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "  Node.js instalado: $nodeVersion" -ForegroundColor Green
    
    # Verificar versao minima (v16+)
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 16) {
        Write-Host "  AVISO: Versao do Node.js e antiga. Recomendado v16 ou superior." -ForegroundColor Yellow
    }
}
else {
    Write-Host "  Node.js NAO esta instalado" -ForegroundColor Red
    $missingTools += "Node.js (https://nodejs.org/)"
}

# Verificar npm
Write-Host "`nVerificando npm..." -ForegroundColor White
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "  npm instalado: v$npmVersion" -ForegroundColor Green
}
else {
    Write-Host "  npm NAO esta instalado" -ForegroundColor Red
    $missingTools += "npm (incluido com Node.js)"
}

# Verificar NestJS CLI (opcional)
Write-Host "`nVerificando NestJS CLI..." -ForegroundColor White
if (Test-Command "nest") {
    $nestVersion = nest --version
    Write-Host "  NestJS CLI instalado: v$nestVersion" -ForegroundColor Green
}
else {
    Write-Host "  NestJS CLI nao esta instalado (opcional)" -ForegroundColor Yellow
    Write-Host "    Instale com: npm install -g @nestjs/cli" -ForegroundColor DarkGray
}

# Verificar SQL Server (conexao)
Write-Host "`nVerificando SQL Server..." -ForegroundColor White
if (Test-Command "sqlcmd") {
    Write-Host "  SQL Server Client (sqlcmd) instalado" -ForegroundColor Green
}
else {
    Write-Host "  sqlcmd nao encontrado (verifique se SQL Server esta instalado)" -ForegroundColor Yellow
}

# Verificar servico SQL Server
$sqlService = Get-Service -Name "MSSQLSERVER" -ErrorAction SilentlyContinue
if ($sqlService) {
    if ($sqlService.Status -eq "Running") {
        Write-Host "  Servico SQL Server esta rodando" -ForegroundColor Green
    }
    else {
        Write-Host "  Servico SQL Server esta parado. Tentando iniciar..." -ForegroundColor Yellow
        try {
            Start-Service -Name "MSSQLSERVER"
            Write-Host "  Servico SQL Server iniciado" -ForegroundColor Green
        }
        catch {
            Write-Host "  Falha ao iniciar SQL Server. Inicie manualmente." -ForegroundColor Red
        }
    }
}
else {
    Write-Host "  Servico SQL Server nao encontrado" -ForegroundColor Yellow
    Write-Host "    Verifique se SQL Server Express/Developer esta instalado" -ForegroundColor DarkGray
}

# Se houver ferramentas faltando, parar
if ($missingTools.Count -gt 0) {
    Write-Host "`nERRO: Ferramentas obrigatorias faltando:" -ForegroundColor Red
    foreach ($tool in $missingTools) {
        Write-Host "  - $tool" -ForegroundColor Red
    }
    Write-Host "`nPor favor, instale as ferramentas necessarias e tente novamente." -ForegroundColor Yellow
    Read-Host "`nPressione ENTER para sair"
    exit 1
}

# 2. LIMPEZA DE PROCESSOS E PORTAS
Write-Host "`n[2/6] Limpando processos e portas..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Matar processos Node.js
Stop-NodeProcesses

# Liberar portas
Stop-ProcessOnPort -Port 3000  # Frontend
Stop-ProcessOnPort -Port 3001  # Backend

Write-Host "`nLimpeza concluida" -ForegroundColor Green

# 3. VERIFICAR ESTRUTURA DO PROJETO
Write-Host "`n[3/6] Verificando estrutura do projeto..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

if (-Not (Test-Path $backendPath)) {
    Write-Host "Diretorio backend nao encontrado!" -ForegroundColor Red
    Read-Host "`nPressione ENTER para sair"
    exit 1
}

if (-Not (Test-Path $frontendPath)) {
    Write-Host "Diretorio frontend nao encontrado!" -ForegroundColor Red
    Read-Host "`nPressione ENTER para sair"
    exit 1
}

Write-Host "  Diretorio backend encontrado" -ForegroundColor Green
Write-Host "  Diretorio frontend encontrado" -ForegroundColor Green

# 4. INSTALAR DEPENDENCIAS DO BACKEND
Write-Host "`n[4/6] Instalando dependencias do backend..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Push-Location $backendPath

if (-Not (Test-Path "node_modules")) {
    Write-Host "  Instalando dependencias (primeira vez)..." -ForegroundColor Yellow
    npm install
}
else {
    Write-Host "  node_modules ja existe, pulando instalacao" -ForegroundColor Green
    Write-Host "  (Delete node_modules para reinstalar)" -ForegroundColor DarkGray
}

Pop-Location

# 5. INSTALAR DEPENDENCIAS DO FRONTEND
Write-Host "`n[5/6] Instalando dependencias do frontend..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Push-Location $frontendPath

if (-Not (Test-Path "node_modules")) {
    Write-Host "  Instalando dependencias (primeira vez)..." -ForegroundColor Yellow
    npm install
}
else {
    Write-Host "  node_modules ja existe, pulando instalacao" -ForegroundColor Green
    Write-Host "  (Delete node_modules para reinstalar)" -ForegroundColor DarkGray
}

Pop-Location

# 6. INICIAR APLICACAO
Write-Host "`n[6/6] Iniciando aplicacao..." -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

Write-Host "`nTodas as verificacoes concluidas!" -ForegroundColor Green
Write-Host "`nIniciando servidores..." -ForegroundColor Yellow
Write-Host "  Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  API Docs: http://localhost:3001/api/docs" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPressione Ctrl+C para encerrar os servidores.`n" -ForegroundColor Yellow

# Criar script temporario para iniciar backend
$backendScript = @"
Set-Location '$backendPath'
Write-Host 'Iniciando Backend (NestJS)...' -ForegroundColor Green
npm run start:dev
"@

# Criar script temporario para iniciar frontend
$frontendScript = @"
Set-Location '$frontendPath'
Start-Sleep -Seconds 5
Write-Host 'Iniciando Frontend (React)...' -ForegroundColor Green
npm start
"@

# Salvar scripts temporarios
$backendScriptPath = Join-Path $env:TEMP "rq-backend.ps1"
$frontendScriptPath = Join-Path $env:TEMP "rq-frontend.ps1"
$backendScript | Out-File -FilePath $backendScriptPath -Encoding UTF8
$frontendScript | Out-File -FilePath $frontendScriptPath -Encoding UTF8

# Iniciar backend em nova janela
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$backendScriptPath`""

# Iniciar frontend em nova janela
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$frontendScriptPath`""

Write-Host "`nServidores iniciados em janelas separadas!" -ForegroundColor Green
Write-Host "`nAguarde alguns segundos para os servidores ficarem prontos..." -ForegroundColor Yellow
Write-Host "Feche as janelas dos servidores para encerrar a aplicacao." -ForegroundColor DarkGray

Start-Sleep -Seconds 3

# Abrir navegador apos alguns segundos
Write-Host "`nAbrindo navegador..." -ForegroundColor Cyan
Start-Sleep -Seconds 8
Start-Process "http://localhost:3000"

Write-Host "`nAplicacao iniciada com sucesso!" -ForegroundColor Green
Write-Host "`nPressione ENTER para sair deste script (os servidores continuarao rodando)" -ForegroundColor Yellow
Read-Host
