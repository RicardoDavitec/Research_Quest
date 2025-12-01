@echo off
REM Script de Inicialização do Research Quest
REM Versão Batch para compatibilidade

echo ========================================
echo   Research Quest - Inicializacao Dev
echo ========================================
echo.

REM Verificar se PowerShell está disponível
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: PowerShell nao encontrado!
    echo Por favor, use Windows com PowerShell instalado.
    pause
    exit /b 1
)

REM Executar script PowerShell
echo Executando script de inicializacao...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"

if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha na execucao do script.
    pause
    exit /b 1
)

exit /b 0
