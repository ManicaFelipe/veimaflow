# 🚀 Como Rodar o VemaFlow

## ✅ Pré-requisitos

- **Java 17+** instalado
- **Node.js 18+** e npm instalados
- **Git** (opcional, para clone)

## 📦 1. Backend (Spring Boot)

### Compilar e rodar com H2 (banco em memória - recomendado para dev):

```powershell
# Navegar até a pasta do backend
cd c:\...\vemaflow

# Definir perfil dev (H2)
$env:SPRING_PROFILES_ACTIVE='dev'

# Compilar
.\mvnw.cmd clean compile

# Rodar
.\mvnw.cmd spring-boot:run
```

✅ **Backend estará rodando em:** `http://localhost:8080`

### Endpoints importantes:

- API base: `http://localhost:8080/api`
- H2 Console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:vemaflow`
  - User: `sa`
  - Password: (vazio)
- Swagger/OpenAPI: `http://localhost:8080/swagger-ui.html`

### 🛠️ Troubleshooting Backend

**Erro: "Lombok not found"**
- ✅ Já corrigido! Lombok está no `pom.xml` e será baixado automaticamente.

**Erro: "Cannot connect to database"**
- Use o perfil `dev` para usar H2 em memória:
  ```powershell
  $env:SPRING_PROFILES_ACTIVE='dev'
  ```

**Erro: "Port 8080 already in use"**
- Mate o processo que está usando a porta ou mude no `application-dev.properties`:
  ```properties
  server.port=8081
  ```

---

## 🎨 2. Frontend (React + Vite)

### Instalar dependências e rodar:

```powershell
# Navegar até a pasta do frontend
cd c:\...\VEIMANFLOW

# Instalar dependências (primeira vez)
npm install

# Rodar dev server
npm run dev
```

✅ **Frontend estará rodando em:** `http://localhost:5173`

### 🛠️ Troubleshooting Frontend

**Erro: "VITE_API_URL not defined"**
- O Vite usa proxy em dev. Ajuste em `vite.config.js` se seu backend não estiver em `http://192.168.0.107:8080`:
  ```javascript
  const rawApi = env.VITE_API_URL || 'http://localhost:8080/api';
  ```

**Erro: "Failed to fetch"**
- Certifique-se de que o backend está rodando em `http://localhost:8080`
- Verifique CORS no backend (já configurado para `localhost:5173` e `localhost:5174`)

**Erro: "Module not found"**
- Execute `npm install` novamente
- Limpe cache: `npm cache clean --force` e reinstale

---

## 🧪 3. Testar a Criação de Projeto

1. **Acesse:** `http://localhost:5173`
2. **Faça login** (se não tiver conta, use `Register`)
3. **Vá em "Projetos"** no menu lateral
4. **Clique em "+ Novo projeto"**
5. **Preencha:**
   - Nome: `Projeto Teste`
   - Descrição: `Teste de criação`
   - Status: `Em andamento`
   - Data Início: (hoje)
   - Data Fim: (amanhã)
6. **Clique em "Salvar"**

### 📋 Logs importantes no Console do Navegador

Abra o DevTools (F12) e veja a aba Console:

```javascript
[ProjetoForm] Enviando payload: { nome: "...", descricao: "...", ... }
[Projetos] Criando novo projeto
[API AUTH] POST /api/projetos | Token: eyJhb... | Type: Bearer
[Projetos] Projeto criado: { id: 1, nome: "...", ... }
```

### 🔴 Se der erro:

**Console mostra `401 Unauthorized`**
- Você não está logado ou o token expirou. Faça login novamente.

**Console mostra `500 Internal Server Error`**
- Veja os logs do backend no terminal onde rodou `mvnw.cmd spring-boot:run`
- Procure por stack traces começando com `java.lang...`

**Console mostra `CORS error`**
- Backend não está rodando OU
- Backend está em porta diferente de 8080. Ajuste `vite.config.js`

---

## 📝 4. Logs Detalhados

### Backend (terminal):

```
[INFO] ... VemaFlowApplication : Started VemaFlowApplication in 3.2 seconds
[INFO] ... ProjetoController : Requisição recebida: criar novo projeto
[INFO] ... ProjetoService : Criando novo projeto: Projeto Teste
[INFO] ... ProjetoService : Projeto criado com ID: 1, UUID: 00001
```

### Frontend (DevTools Console):

```javascript
[API AUTH] POST /api/projetos | Token: eyJhb... | Type: Bearer
[Projetos] handleSave chamado com: { nome: "Projeto Teste", ... }
[Projetos] Criando novo projeto
[Projetos] Projeto criado: { id: 1, uuid: "00001", nome: "Projeto Teste", ... }
```

---

## 🎯 5. Estrutura de Pastas

```
VeimaFlow/
├── VEIMAFLOW-BACK/                    # Backend Spring Boot
│   ├── src/main/java/           # Código Java
│   ├── src/main/resources/      # application.properties
│   ├── pom.xml                  # Dependências Maven
│   └── mvnw.cmd                 # Maven Wrapper (Windows)
│
├── VEIMAFLOW-FRONT/                  # Frontend React + Vite
│   ├── src/                     # Código React
│   ├── package.json             # Dependências npm
│   └── vite.config.js           # Config Vite + proxy
│
├── BACKLOG.md                   # Backlog de features
├── PRODUCT_PLAN.md              # Plano de produto
├── DELIVERY_SUMMARY.md          # Resumo de entregas
└── COMO_RODAR.md                # Este arquivo!
```

---

## 🚨 Problemas Comuns e Soluções

| Problema | Solução |
|----------|---------|
| Backend não compila | Execute `.\mvnw.cmd clean compile` e veja erros |
| Frontend não inicia | Execute `npm install` e `npm run dev` |
| Erro 401 ao criar projeto | Faça login novamente, token pode ter expirado |
| Erro 500 ao criar projeto | Veja logs do backend, pode ser validação de dados |
| CORS error | Certifique-se que backend está em `localhost:8080` |
| Porta 8080 ocupada | Mude em `application-dev.properties`: `server.port=8081` |
| Times não são criados | Normal! Endpoint `/api/times` existe mas pode falhar; projeto é salvo sem time |

---

## ✅ Checklist Pós-Instalação

- [ ] Backend compila sem erros (`.\mvnw.cmd clean compile`)
- [ ] Backend roda em `http://localhost:8080` com perfil `dev`
- [ ] H2 Console acessível em `http://localhost:8080/h2-console`
- [ ] Frontend instala dependências (`npm install`)
- [ ] Frontend roda em `http://localhost:5173`
- [ ] Console do navegador NÃO mostra erros de CORS
- [ ] Login funciona (gera token JWT)
- [ ] Criação de projeto funciona (POST `/api/projetos` retorna 200)

---

## 📧 Suporte

Se encontrar problemas:

1. **Verifique logs do backend** (terminal onde rodou `mvnw.cmd spring-boot:run`)
2. **Verifique logs do frontend** (DevTools Console - F12)
3. **Compare com os logs esperados** acima neste documento
4. **Capture screenshots dos erros** para debug

---

🎉 **Pronto! Agora você pode criar projetos, tarefas, anexos, visualizar SLA e dashboards!**
