# Script para Parar todos os servicos do Research Quest
# Encerra processos Node.js e libera portas

Write-Host "========================================" -ForegroundColor Red
Write-Host "  Research Quest - Parar Servicos" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Funcao para matar processos em portas especificas
function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-Host "Liberando porta $Port..." -ForegroundColor Yellow
    
    $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
    
    if ($connections) {
        foreach ($connection in $connections) {
            $parts = $connection -split '\s+' | Where-Object { $_ -ne '' }
            $pid = $parts[-1]
            
            if ($pid -match '^\d+$') {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  Encerrando '$($process.ProcessName)' (PID: $pid)" -ForegroundColor Red
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    }
                }
                catch {
                    Write-Host "  Processo PID $pid ja encerrado" -ForegroundColor DarkGray
                }
            }
        }
        Write-Host "  Porta $Port liberada" -ForegroundColor Green
    }
    else {
        Write-Host "  Porta $Port ja esta livre" -ForegroundColor Green
    }
}

# Encerrar processos Node.js
Write-Host "`nEncerrando todos os processos Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        Write-Host "  Encerrando Node.js (PID: $($proc.Id)) - $($proc.MainWindowTitle)" -ForegroundColor Red
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "  Processos Node.js encerrados" -ForegroundColor Green
}
else {
    Write-Host "  Nenhum processo Node.js em execucao" -ForegroundColor Green
}

# Liberar portas especificas
Write-Host "`nLiberando portas..." -ForegroundColor Yellow
Stop-ProcessOnPort -Port 3000  # Frontend React
Stop-ProcessOnPort -Port 3001  # Backend NestJS
Stop-ProcessOnPort -Port 5000  # Porta alternativa
Stop-ProcessOnPort -Port 8080  # Porta alternativa

Write-Host "`nTodos os servicos foram encerrados!" -ForegroundColor Green
Write-Host "`nPressione ENTER para sair" -ForegroundColor Yellow
Read-Host
