# Script PowerShell para habilitar SQL Authentication e criar usuário

# Parar o serviço SQL Server
Write-Host "Parando SQL Server..." -ForegroundColor Yellow
Stop-Service -Name "MSSQL`$SQLEXPRESS" -Force

# Habilitar modo de autenticação mista no registro
Write-Host "Habilitando autenticação mista..." -ForegroundColor Yellow
$registryPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer"
Set-ItemProperty -Path $registryPath -Name "LoginMode" -Value 2

# Iniciar o serviço SQL Server
Write-Host "Iniciando SQL Server..." -ForegroundColor Yellow
Start-Service -Name "MSSQL`$SQLEXPRESS"

# Aguardar o serviço iniciar
Start-Sleep -Seconds 5

Write-Host "✅ Autenticação mista habilitada!" -ForegroundColor Green
Write-Host ""
Write-Host "Agora execute o script create-sql-user.sql para criar o usuário" -ForegroundColor Cyan
