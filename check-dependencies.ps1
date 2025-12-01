# Script de Verificacao de Dependencias do Research Quest
# Verifica todas as ferramentas necessarias para executar o projeto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificacao de Dependencias" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Atualizar PATH do sistema
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$allOk = $true

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

# Funcao para exibir status
function Show-Status {
    param(
        [string]$Name,
        [bool]$IsInstalled,
        [string]$Version = "",
        [string]$InstallUrl = ""
    )
    
    Write-Host "`n$Name" -ForegroundColor White
    Write-Host "==================================================" -ForegroundColor DarkGray
    
    if ($IsInstalled) {
        Write-Host "  Status: " -NoNewline
        Write-Host "OK - INSTALADO" -ForegroundColor Green
        if ($Version) {
            Write-Host "  Versao: $Version" -ForegroundColor Cyan
        }
    }
    else {
        Write-Host "  Status: " -NoNewline
        Write-Host "NAO INSTALADO" -ForegroundColor Red
        if ($InstallUrl) {
            Write-Host "  Download: $InstallUrl" -ForegroundColor Yellow
        }
        $script:allOk = $false
    }
}

Write-Host "Verificando componentes do sistema...`n" -ForegroundColor Yellow

# 1. Node.js
$nodeInstalled = Test-Command "node"
$nodeVersion = if ($nodeInstalled) { node --version } else { "" }
Show-Status -Name "Node.js" -IsInstalled $nodeInstalled -Version $nodeVersion -InstallUrl "https://nodejs.org/"

if ($nodeInstalled) {
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 16) {
        Write-Host "  AVISO: Versao antiga. Recomendado v16 ou superior." -ForegroundColor Yellow
    }
}

# 2. npm
$npmInstalled = Test-Command "npm"
$npmVersion = if ($npmInstalled) { "v" + (npm --version) } else { "" }
Show-Status -Name "npm (Node Package Manager)" -IsInstalled $npmInstalled -Version $npmVersion -InstallUrl "Incluido com Node.js"

# 3. NestJS CLI
$nestInstalled = Test-Command "nest"
$nestVersion = if ($nestInstalled) { "v" + (nest --version) } else { "" }
Show-Status -Name "NestJS CLI (Opcional)" -IsInstalled $nestInstalled -Version $nestVersion -InstallUrl "npm install -g @nestjs/cli"

if (-Not $nestInstalled) {
    Write-Host "  Nota: Nao obrigatorio, mas recomendado para desenvolvimento" -ForegroundColor DarkGray
}

# 4. Git
$gitInstalled = Test-Command "git"
$gitVersion = if ($gitInstalled) { (git --version) -replace 'git version ', 'v' } else { "" }
Show-Status -Name "Git" -IsInstalled $gitInstalled -Version $gitVersion -InstallUrl "https://git-scm.com/download/win"

# 5. SQL Server
$sqlcmdInstalled = Test-Command "sqlcmd"
Show-Status -Name "SQL Server Client Tools (sqlcmd)" -IsInstalled $sqlcmdInstalled -InstallUrl "https://aka.ms/ssmsfullsetup"

# Verificar servico SQL Server
Write-Host "`nSQL Server Service" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor DarkGray

$sqlService = Get-Service -Name "MSSQLSERVER" -ErrorAction SilentlyContinue
if ($sqlService) {
    Write-Host "  Status: " -NoNewline
    if ($sqlService.Status -eq "Running") {
        Write-Host "RODANDO" -ForegroundColor Green
        Write-Host "  Estado: $($sqlService.Status)" -ForegroundColor Cyan
    }
    else {
        Write-Host "PARADO" -ForegroundColor Yellow
        Write-Host "  Estado: $($sqlService.Status)" -ForegroundColor Cyan
        Write-Host "  Acao: Inicie o servico ou execute o script start-dev.ps1" -ForegroundColor Yellow
    }
}
else {
    Write-Host "  Status: " -NoNewline
    Write-Host "SERVICO NAO ENCONTRADO" -ForegroundColor Red
    Write-Host "  Download: https://www.microsoft.com/sql-server/sql-server-downloads" -ForegroundColor Yellow
    $script:allOk = $false
}

# 6. Verificar PowerShell
Write-Host "`nPowerShell" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor DarkGray
Write-Host "  Status: " -NoNewline
Write-Host "INSTALADO" -ForegroundColor Green
Write-Host "  Versao: v$($PSVersionTable.PSVersion.Major).$($PSVersionTable.PSVersion.Minor)" -ForegroundColor Cyan

# 7. Verificar estrutura do projeto
Write-Host "`nEstrutura do Projeto" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor DarkGray

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"
$backendPackage = Join-Path $backendPath "package.json"
$frontendPackage = Join-Path $frontendPath "package.json"

$backendExists = Test-Path $backendPath
$frontendExists = Test-Path $frontendPath
$backendPkgExists = Test-Path $backendPackage
$frontendPkgExists = Test-Path $frontendPackage

Write-Host "  Backend: " -NoNewline
if ($backendExists -and $backendPkgExists) {
    Write-Host "OK" -ForegroundColor Green
}
else {
    Write-Host "ERRO" -ForegroundColor Red
    $script:allOk = $false
}

Write-Host "  Frontend: " -NoNewline
if ($frontendExists -and $frontendPkgExists) {
    Write-Host "OK" -ForegroundColor Green
}
else {
    Write-Host "ERRO" -ForegroundColor Red
    $script:allOk = $false
}

# Verificar node_modules
$backendNodeModules = Join-Path $backendPath "node_modules"
$frontendNodeModules = Join-Path $frontendPath "node_modules"

Write-Host "`n  Dependencias Instaladas:" -ForegroundColor DarkGray
Write-Host "    Backend node_modules: " -NoNewline
if (Test-Path $backendNodeModules) {
    Write-Host "OK" -ForegroundColor Green
}
else {
    Write-Host "Faltando (Execute npm install no backend)" -ForegroundColor Yellow
}

Write-Host "    Frontend node_modules: " -NoNewline
if (Test-Path $frontendNodeModules) {
    Write-Host "OK" -ForegroundColor Green
}
else {
    Write-Host "Faltando (Execute npm install no frontend)" -ForegroundColor Yellow
}

# 8. Verificar portas
Write-Host "`nVerificacao de Portas" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor DarkGray

function Test-Port {
    param([int]$Port)
    
    $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
    return $connections -ne $null
}

$port3000InUse = Test-Port -Port 3000
$port3001InUse = Test-Port -Port 3001

Write-Host "  Porta 3000 (Frontend): " -NoNewline
if ($port3000InUse) {
    Write-Host "EM USO" -ForegroundColor Yellow
}
else {
    Write-Host "LIVRE" -ForegroundColor Green
}

Write-Host "  Porta 3001 (Backend): " -NoNewline
if ($port3001InUse) {
    Write-Host "EM USO" -ForegroundColor Yellow
}
else {
    Write-Host "LIVRE" -ForegroundColor Green
}

# Resumo final
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($allOk) {
    Write-Host "`nTodos os componentes estao instalados!" -ForegroundColor Green
    Write-Host "`nVoce pode executar o projeto com:" -ForegroundColor Yellow
    Write-Host "  .\start-dev.bat" -ForegroundColor Cyan
    Write-Host "  ou" -ForegroundColor DarkGray
    Write-Host "  .\start-dev.ps1" -ForegroundColor Cyan
}
else {
    Write-Host "`nAlguns componentes estao faltando" -ForegroundColor Red
    Write-Host "`nPor favor, instale os componentes marcados em vermelho." -ForegroundColor Yellow
    Write-Host "Apos instalar, execute este script novamente para verificar." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "`nPressione ENTER para sair" -ForegroundColor DarkGray
Read-Host
