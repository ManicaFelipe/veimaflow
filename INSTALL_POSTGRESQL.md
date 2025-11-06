# 🐘 Guia de Instalação do PostgreSQL - VemaFlow

## ⚠️ O problema detectado

O PowerShell precisa ser executado **como Administrador** para instalar o PostgreSQL.

---

## 🚀 Opção 1: Instalar via Chocolatey (RECOMENDADO - Mais Rápido)

### Passo a passo:

1. **Feche o PowerShell atual**

2. **Abra PowerShell como Administrador**:
   - Pressione `Windows + X`
   - Clique em **"Windows PowerShell (Admin)"** ou **"Terminal (Admin)"**
   - Se aparecer uma mensagem de segurança, clique em **"Sim"**

3. **Execute o comando de instalação**:
   ```powershell
   choco install postgresql -y
   ```

4. **Aguarde a instalação** (pode levar 2-5 minutos)

5. **Configure a senha do postgres**:
   - Durante a instalação, será solicitada uma senha
   - **IMPORTANTE**: Use a mesma senha configurada no projeto: `veiman`
   - Ou anote a senha que usar para atualizar depois

6. **Verifique a instalação**:
   ```powershell
   psql --version
   ```

7. **Retorne ao diretório do projeto**:
   ```powershell
   cd C:\...\scripts
   .\setup-postgres.ps1
   ```

Ou em uma única linha (use ponto e vírgula para encadear comandos no PowerShell):
```powershell
cd C:\...\scripts; .\setup-postgres.ps1
```

---

## 📥 Opção 2: Download Manual (Se preferir interface gráfica)

### Passo a passo:

1. **Baixe o instalador**:
   - Acesse: https://www.postgresql.org/download/windows/
   - Clique em **"Download the installer"**
   - Escolha a versão mais recente (ex: PostgreSQL 16.x)
   - Baixe o instalador para Windows x86-64

2. **Execute o instalador**:
   - Clique com botão direito → **"Executar como administrador"**
   - Siga o assistente de instalação

3. **Durante a instalação**:
   - **Porta**: deixe `5432` (padrão)
   - **Senha do superusuário (postgres)**: digite `veiman`
   - **Locale**: Portuguese, Brazil (ou English)
   - Instale todos os componentes sugeridos

4. **Após a instalação**:
   - Verifique se o serviço PostgreSQL está rodando:
     - `Windows + R` → digite `services.msc` → Enter
     - Procure por **"postgresql-x64-XX"** (deve estar "Em execução")

5. **Teste no PowerShell**:
   ```powershell
   psql --version
   ```

6. **Configure o banco**:
   ```powershell
   cd C:\...\scripts
   .\setup-postgres.ps1
   ```

Em uma linha:
```powershell
cd C:\...\scripts; .\setup-postgres.ps1
```

---

## 🔧 Opção 3: Continuar com H2 (Desenvolvimento)

Se você **NÃO** precisa de PostgreSQL agora e quer continuar desenvolvendo:

### Não precisa instalar nada! 

O projeto já está configurado para usar **H2** em modo desenvolvimento:

```powershell
cd C:\Users\felipe.manica\Desktop\VemaFlow\vemaflow
$env:SPRING_PROFILES_ACTIVE='dev'
.\mvnw.cmd spring-boot:run
```

**Quando usar H2**:
- ✅ Desenvolvimento local
- ✅ Testes rápidos
- ✅ Não precisa instalar nada
- ✅ Dados temporários (perdem ao reiniciar)

**Quando usar PostgreSQL**:
- ✅ Produção
- ✅ Deploy real
- ✅ Dados persistentes
- ✅ Performance em escala

---

## 🎯 Recomendação

Para **desenvolvimento atual**: 
→ Continue com **H2** (não precisa instalar PostgreSQL agora)

Para **produção futura**:
→ Instale **PostgreSQL** quando for fazer deploy real

---

## 📝 Atualizar Senha do PostgreSQL (se necessário)

Se você instalou com senha diferente de `veiman`, atualize o arquivo:

**`veimaflow/src/main/resources/application.properties`**:

```properties
spring.datasource.password=SUA_SENHA_AQUI
```

---

## ❓ Troubleshooting

### "psql: comando não encontrado" após instalar

**Solução**: Adicione PostgreSQL ao PATH manualmente:

1. Pressione `Windows + Pause` → **"Configurações avançadas do sistema"**
2. Clique em **"Variáveis de Ambiente"**
3. Em **"Variáveis do sistema"**, selecione **"Path"** → **"Editar"**
4. Clique em **"Novo"** e adicione:
   ```
   C:\Program Files\PostgreSQL\16\bin
   ```
   *(ajuste o número da versão se necessário)*
5. Clique em **"OK"** em todas as janelas
6. **Feche e reabra o PowerShell**
7. Teste: `psql --version`

### "Acesso negado" ao executar Chocolatey

- Certifique-se de estar executando PowerShell **como Administrador**
- Botão direito no ícone do PowerShell → **"Executar como administrador"**

### "Serviço PostgreSQL não inicia"

1. Abra **Serviços** (`services.msc`)
2. Procure por **"postgresql-x64-XX"**
3. Botão direito → **"Iniciar"**
4. Se der erro, verifique os logs em:
   ```
   C:\Program Files\PostgreSQL\16\data\log\
   ```

---

## 🎉 Próximos Passos (Após Instalar PostgreSQL)

1. **Execute o script de setup**:
   ```powershell
   cd C:\...\scripts
   .\setup-postgres.ps1
   ```

2. **Rode o backend em modo produção**:
   ```powershell
   cd ..
   .\mvnw.cmd spring-boot:run
   ```
   *(sem `SPRING_PROFILES_ACTIVE=dev`)*

3. **Acesse a aplicação**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080
   - Swagger: http://localhost:8080/swagger/index.html

---

## 📞 Precisa de Ajuda?

- Documentação oficial: https://www.postgresql.org/docs/
- Chocolatey: https://community.chocolatey.org/packages/postgresql
- Scripts do projeto: `vemaflow/scripts/README.md`

---

**Dica Final**: Para desenvolvimento, o H2 é mais que suficiente. Só instale PostgreSQL quando realmente precisar de persistência ou for fazer deploy! 🚀
