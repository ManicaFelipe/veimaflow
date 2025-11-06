# VEIMANFLOW

Sistema de gerenciamento de fluxo de trabalho usando React, Vite e Tailwind CSS.

## ✨ Funcionalidades

- Kanban e Timeline de tarefas com progresso agregado (%)
- Comentários por tarefa (com @menções em texto)
- Subtarefas por tarefa (CRUD simples; progresso calculado automaticamente)
- Dependências entre tarefas (gestão e indicador opcional na Timeline; detecção de ciclos)
- Marcos do projeto (CRUD) com lembrete em dias
- Lembretes de marcos próximos (endpoint `/api/marcos/lembretes`)
- Preferências de visualização salvas por usuário (Projetos)

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ (LTS recomendado)
- npm 9+ (incluído com Node.js)
- Git

### Instalação

1. Clone o repositório:

```powershell
git clone [seu-repositorio]
cd VEIMANFLOW
```

1. Instale as dependências:

```powershell
npm install
```

1. Configure as variáveis de ambiente:

- Copie `.env` para `.env.local`
- Ajuste `VITE_API_URL` conforme necessário


### Desenvolvimento

Inicie o servidor de desenvolvimento:

```powershell
npm run dev
```

O app estará disponível em [http://localhost:5173](http://localhost:5173)

Integração com backend Spring Boot em `http://localhost:8080` via proxy `/api` no dev.

### Produção

1. Gere o build:

```powershell
npm run build
```

1. Teste localmente:

```powershell
npm run preview
```

## 📁 Estrutura do Projeto

```text
VEIMANFLOW/
├── public/               # Arquivos estáticos
├── src/
│   ├── assets/          # Imagens, fontes, etc
│   ├── components/      # Componentes React reutilizáveis
│   ├── context/        # Contextos React (ex: AuthContext)
│   ├── pages/          # Componentes de página
│   └── services/       # Serviços/API
```

### Onde encontrar os novos recursos no app

- Tarefas → abrir uma tarefa → seção "Comentários" e "Subtarefas" dentro do modal
- Tarefas → Timeline → opção "Mostrar dependências (contagem)" para exibir número de pré-requisitos em cada barra
- Tarefas → abrir uma tarefa → seção "Dependências" para adicionar/remover relações
- Projetos → selecionar um projeto → painel lateral → seção "Marcos do projeto" para listar/criar/excluir

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza build local
- `npm run test` - Executa testes (a ser implementado)
- `npm run lint` - Verifica código com ESLint

## 📝 Próximos Passos

- [ ] Implementar testes unitários (Jest/Testing Library)
- [ ] Adicionar storybook para documentação de componentes
- [ ] Implementar autenticação completa
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Validação avançada de ciclos de dependência
- [ ] Edição inline de marcos (além de exclusão)
- [ ] Documentar APIs e integração backend (OpenAPI atualizado em `vemaflow/api/openapi.yaml`)

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes

---

Feito com ❤️ pela equipe VEIMANFLOW
