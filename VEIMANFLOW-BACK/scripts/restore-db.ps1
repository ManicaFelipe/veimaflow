# Script para restaurar backup do banco PostgreSQL

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "VemaFlow - Restaurar PostgreSQL" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$DB_NAME = "vemaflow"
$DB_USER = "postgres"
$BACKUP_DIR = "..\backups"

# Listar backups disponíveis se arquivo não foi especificado
if (-not $BackupFile) {
    Write-Host "Backups disponíveis:" -ForegroundColor Yellow
    Write-Host ""
    
    if (Test-Path $BACKUP_DIR) {
        $backups = Get-ChildItem -Path $BACKUP_DIR -Filter "*.sql" | Sort-Object LastWriteTime -Descending
        
        if ($backups.Count -eq 0) {
            Write-Host "Nenhum backup encontrado em $BACKUP_DIR" -ForegroundColor Red
            exit 1
        }
        
        for ($i = 0; $i -lt $backups.Count; $i++) {
            $backup = $backups[$i]
            $size = [math]::Round($backup.Length / 1KB, 2)
            Write-Host "[$($i+1)] $($backup.Name) - $size KB - $($backup.LastWriteTime)" -ForegroundColor White
        }
        
        Write-Host ""
        $selection = Read-Host "Selecione o número do backup para restaurar (ou Enter para cancelar)"
        
        if ([string]::IsNullOrWhiteSpace($selection)) {
            Write-Host "Operação cancelada." -ForegroundColor Yellow
            exit 0
        }
        
        $index = [int]$selection - 1
        if ($index -lt 0 -or $index -ge $backups.Count) {
            Write-Host "Seleção inválida!" -ForegroundColor Red
            exit 1
        }
        
        $BackupFile = $backups[$index].FullName
    } else {
        Write-Host "Diretório de backups não encontrado: $BACKUP_DIR" -ForegroundColor Red
        exit 1
    }
}

# Verificar se arquivo existe
if (-not (Test-Path $BackupFile)) {
    Write-Host "Arquivo não encontrado: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Arquivo selecionado: $BackupFile" -ForegroundColor White
Write-Host ""
Write-Host "ATENÇÃO: Esta operação irá RECRIAR o banco '$DB_NAME'!" -ForegroundColor Red
Write-Host "Todos os dados atuais serão PERDIDOS!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Tem certeza que deseja continuar? (digite SIM para confirmar)"

if ($confirm -ne "SIM") {
    Write-Host "Operação cancelada." -ForegroundColor Yellow
    exit 0
}

# Perguntar senha do postgres
Write-Host ""
Write-Host "Digite a senha do usuário postgres:" -ForegroundColor Yellow
$pgPassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
$env:PGPASSWORD = $plainPassword

# Dropar e recriar banco
Write-Host ""
Write-Host "Recriando banco..." -ForegroundColor Yellow
psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME ENCODING 'UTF8';"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao recriar banco!" -ForegroundColor Red
    $env:PGPASSWORD = $null
    exit 1
}

# Restaurar backup
Write-Host "Restaurando backup..." -ForegroundColor Yellow
psql -U $DB_USER -d $DB_NAME -f $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Backup restaurado com sucesso!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Erro ao restaurar backup!" -ForegroundColor Red
    exit 1
}

# Limpar senha
$env:PGPASSWORD = $null

Write-Host ""
