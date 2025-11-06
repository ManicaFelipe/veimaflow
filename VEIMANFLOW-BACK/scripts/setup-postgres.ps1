param(
    [Parameter(Mandatory=$false)]
    [string]$PgPassword
)

# Script para configurar PostgreSQL localmente para VemaFlow
# Execute como administrador se necessário

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "VemaFlow - Setup PostgreSQL Local" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se PostgreSQL está instalado
$pgVersion = psql --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "PostgreSQL não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opções de instalação:" -ForegroundColor Yellow
    Write-Host "1. Download oficial: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. Via chocolatey: choco install postgresql" -ForegroundColor White
    Write-Host "3. Via scoop: scoop install postgresql" -ForegroundColor White
    Write-Host ""
    Write-Host "Após instalar, execute este script novamente." -ForegroundColor Yellow
    exit 1
}

Write-Host "PostgreSQL encontrado: $pgVersion" -ForegroundColor Green
Write-Host ""

# Configurações do banco
$DB_NAME = "vemaflow"
$DB_USER = "postgres"
$DB_PASSWORD = "veiman"
$DB_PORT = "5432"

Write-Host "Configurações:" -ForegroundColor Yellow
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host "  Password: $DB_PASSWORD" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host ""

# Obter senha do postgres (param ou prompt)
if ([string]::IsNullOrWhiteSpace($PgPassword)) {
    Write-Host "Digite a senha do usuário postgres:" -ForegroundColor Yellow
    $pgPassword = Read-Host -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    $env:PGPASSWORD = $plainPassword
} else {
    $env:PGPASSWORD = $PgPassword
}

# Verificar conexão
Write-Host ""
Write-Host "Testando conexão com PostgreSQL..." -ForegroundColor Yellow
$testConnection = psql -U postgres -c "SELECT version();" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao conectar ao PostgreSQL!" -ForegroundColor Red
    Write-Host $testConnection -ForegroundColor Red
    exit 1
}
Write-Host "Conexão OK!" -ForegroundColor Green
Write-Host ""

# Verificar se o banco já existe
Write-Host "Verificando se banco '$DB_NAME' já existe..." -ForegroundColor Yellow
$dbExists = psql -U postgres -lqt | Select-String -Pattern "^\s*$DB_NAME\s"
if ($dbExists) {
    Write-Host "Banco '$DB_NAME' já existe!" -ForegroundColor Yellow
    Write-Host ""
    $recreate = Read-Host "Deseja recriar o banco? (S/N)"
    if ($recreate -eq "S" -or $recreate -eq "s") {
        Write-Host "Removendo banco existente..." -ForegroundColor Yellow
        psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Banco removido com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "Erro ao remover banco!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Mantendo banco existente. Script finalizado." -ForegroundColor Yellow
        exit 0
    }
}

# Criar banco
Write-Host ""
Write-Host "Criando banco '$DB_NAME'..." -ForegroundColor Yellow
psql -U postgres -c "CREATE DATABASE $DB_NAME ENCODING 'UTF8';"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Banco criado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Erro ao criar banco!" -ForegroundColor Red
    exit 1
}

# Criar extensões úteis
Write-Host ""
Write-Host "Criando extensões..." -ForegroundColor Yellow
psql -U postgres -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql -U postgres -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";"
Write-Host "Extensões criadas!" -ForegroundColor Green

# Limpar variável de senha
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "Setup concluído com sucesso!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Certifique-se de que application.properties está configurado corretamente" -ForegroundColor White
Write-Host "2. Execute: .\mvnw.cmd spring-boot:run (sem SPRING_PROFILES_ACTIVE=dev)" -ForegroundColor White
Write-Host "3. O Hibernate irá criar as tabelas automaticamente (ddl-auto=update)" -ForegroundColor White
Write-Host ""
Write-Host "String de conexão:" -ForegroundColor Yellow
Write-Host "jdbc:postgresql://localhost:$DB_PORT/$DB_NAME" -ForegroundColor White
Write-Host ""
