# Scripts de Gerenciamento do Banco de Dados

Esta pasta contém scripts PowerShell para gerenciar o banco de dados PostgreSQL do VemaFlow.

## 📋 Pré-requisitos

- PostgreSQL instalado e rodando localmente
- PowerShell (vem instalado no Windows)
- Acesso de administrador pode ser necessário

## 🚀 Scripts Disponíveis

### 1. setup-postgres.ps1
**Propósito**: Configurar PostgreSQL pela primeira vez

**Uso**:
```powershell
cd scripts
.\setup-postgres.ps1
```

**O que faz**:
- Verifica se PostgreSQL está instalado
- Cria o banco `vemaflow`
- Configura extensões (uuid-ossp, pg_trgm)
- Mostra próximos passos

**Quando usar**: Na primeira vez que for rodar em produção ou em uma nova máquina.

---

### 2. backup-db.ps1
**Propósito**: Criar backup do banco de dados

**Uso**:
```powershell
cd scripts
.\backup-db.ps1
```

**O que faz**:
- Cria backup completo do banco
- Salva em `../backups/vemaflow_backup_YYYYMMDD_HHMMSS.sql`
- Mostra tamanho do arquivo

**Quando usar**: 
- Antes de fazer atualizações importantes
- Periodicamente (diário/semanal)
- Antes de mudar estrutura do banco

---

### 3. restore-db.ps1
**Propósito**: Restaurar backup do banco de dados

**Uso**:
```powershell
cd scripts
# Modo interativo (lista backups disponíveis)
.\restore-db.ps1

# Ou especificar arquivo diretamente
.\restore-db.ps1 -BackupFile "..\backups\vemaflow_backup_20241102_173000.sql"
```

**O que faz**:
- Lista backups disponíveis
- Permite selecionar qual restaurar
- Recria o banco com os dados do backup

**⚠️ ATENÇÃO**: Esta operação **APAGA TODOS OS DADOS ATUAIS** e substitui pelo backup!

---

## 🗂️ Estrutura de Diretórios

```
vemaflow/
├── scripts/
│   ├── setup-postgres.ps1
│   ├── backup-db.ps1
│   ├── restore-db.ps1
│   └── README.md (este arquivo)
├── backups/               # Criado automaticamente
│   └── vemaflow_backup_*.sql
└── src/
    └── main/
        └── resources/
            ├── application.properties         # Produção (PostgreSQL)
            └── application-dev.properties    # Dev (H2)
```

## 🔄 Workflow Típico

### Desenvolvimento Local (H2)
```powershell
# Rodar backend em modo dev (usa H2 in-memory)
cd vemaflow
$env:SPRING_PROFILES_ACTIVE='dev'
.\mvnw.cmd spring-boot:run
```

### Produção Local (PostgreSQL)

**Primeira vez**:
```powershell
# 1. Configurar PostgreSQL
cd vemaflow\scripts
.\setup-postgres.ps1

# 2. Rodar backend em modo produção
cd ..
.\mvnw.cmd spring-boot:run
```

**Rotina diária**:
```powershell
# Fazer backup antes de rodar
cd vemaflow\scripts
.\backup-db.ps1

# Rodar aplicação
cd ..
.\mvnw.cmd spring-boot:run
```

**Em caso de problema**:
```powershell
# Restaurar backup anterior
cd vemaflow\scripts
.\restore-db.ps1
```

## 📊 Diferenças entre Dev e Prod

| Aspecto | Dev (H2) | Prod (PostgreSQL) |
|---------|----------|-------------------|
| **Ativação** | `SPRING_PROFILES_ACTIVE=dev` | Sem variável (default) |
| **Banco** | H2 in-memory | PostgreSQL persistente |
| **Dados** | Perdidos ao reiniciar | Persistem entre reinícios |
| **Console** | http://localhost:8080/h2-console | Não disponível |
| **Backup** | Não necessário | Recomendado |
| **Performance** | Mais rápido (memória) | Mais lento (disco) |
| **Use para** | Desenvolvimento, testes | Produção, dados reais |

## 🔧 Troubleshooting

### "PostgreSQL não encontrado"
**Solução**: Instalar PostgreSQL
- Download: https://www.postgresql.org/download/windows/
- Via Chocolatey: `choco install postgresql`
- Via Scoop: `scoop install postgresql`

### "Erro ao conectar ao PostgreSQL"
**Possíveis causas**:
1. PostgreSQL não está rodando
   - Verifique: Serviços do Windows → postgresql
2. Senha incorreta
   - Use a senha definida na instalação
3. Porta 5432 em uso
   - Verifique se outra instância está rodando

### "Banco já existe"
**Solução**: 
- Script pergunta se quer recriar
- Ou remova manualmente: `DROP DATABASE vemaflow;`

### "Permissão negada"
**Solução**:
- Execute PowerShell como Administrador
- Ou ajuste permissões do usuário postgres

## 📝 Configurações do Banco

Definidas em `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/vemaflow
spring.datasource.username=postgres
spring.datasource.password=veiman
spring.jpa.hibernate.ddl-auto=update
```

Para alterar, edite o arquivo e reinicie a aplicação.

## 🔐 Segurança em Produção

⚠️ **IMPORTANTE para deploy real**:

1. **Não commite senhas** no Git
2. Use **variáveis de ambiente**:
   ```powershell
   $env:DB_PASSWORD='senha_segura'
   ```
3. Altere a senha padrão `veiman` para algo forte
4. Configure SSL no PostgreSQL
5. Restrinja acesso à rede (firewall)
6. Use usuário dedicado (não `postgres`)

## 📚 Recursos Adicionais

- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Spring Boot Database](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.sql.datasource)
- [JPA/Hibernate](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.sql.jpa-and-spring-data)

---

**Dúvidas?** Consulte os comentários nos próprios scripts ou a documentação do projeto.
