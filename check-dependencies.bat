@echo off
REM Script de Verificação de Dependências

echo ========================================
echo   Verificacao de Dependencias
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0check-dependencies.ps1"

exit /b 0
