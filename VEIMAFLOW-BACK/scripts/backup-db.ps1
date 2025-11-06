# Script para fazer backup do banco PostgreSQL

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "VemaFlow - Backup PostgreSQL" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Configurações
$DB_NAME = "vemaflow"
$DB_USER = "postgres"
$BACKUP_DIR = "..\backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\vemaflow_backup_$TIMESTAMP.sql"

# Criar diretório de backup se não existir
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "Diretório de backup criado: $BACKUP_DIR" -ForegroundColor Green
}

# Perguntar senha do postgres
Write-Host "Digite a senha do usuário postgres:" -ForegroundColor Yellow
$pgPassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
$env:PGPASSWORD = $plainPassword

Write-Host ""
Write-Host "Criando backup..." -ForegroundColor Yellow
Write-Host "Arquivo: $BACKUP_FILE" -ForegroundColor White

# Fazer backup
pg_dump -U $DB_USER -d $DB_NAME -F p -f $BACKUP_FILE

if ($LASTEXITCODE -eq 0) {
    $fileSize = (Get-Item $BACKUP_FILE).Length / 1KB
    Write-Host ""
    Write-Host "Backup concluído com sucesso!" -ForegroundColor Green
    Write-Host "Tamanho: $([math]::Round($fileSize, 2)) KB" -ForegroundColor White
    Write-Host "Local: $BACKUP_FILE" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Erro ao criar backup!" -ForegroundColor Red
    exit 1
}

# Limpar senha
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "Para restaurar este backup, use:" -ForegroundColor Yellow
Write-Host "  psql -U postgres -d vemaflow -f $BACKUP_FILE" -ForegroundColor White
Write-Host ""
