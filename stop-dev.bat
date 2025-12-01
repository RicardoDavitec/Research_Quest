@echo off
REM Script para Parar todos os serviços do Research Quest

echo ========================================
echo   Research Quest - Parar Servicos
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0stop-dev.ps1"

exit /b 0
