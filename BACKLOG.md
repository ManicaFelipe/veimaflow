# Backlog de Produto

Este backlog organiza as melhorias de negócio sugeridas em épicos, com features e histórias, prioridades e critérios de aceite resumidos. Use este arquivo como referência para planejamento de sprints.

## Épico 1: Colaboração em Tarefas (Comentários, Menções e Anexos)

- Feature 1.1: Comentários em Tarefas
  - História: Como membro do time, quero comentar em uma tarefa para registrar decisões e dúvidas.
  - Critérios de aceite:
    - GET/POST /api/tarefas/{id}/comentarios
    - Comentários ordenados por data (asc)
    - Registro de autor e data
  - Status: Entregue ✅ (API + UI)
- Feature 1.2: Menções (@usuario)
  - História: Como membro, quero mencionar alguém para notificá-lo.
  - Critérios de aceite: Parsing de @nome; notificação gerada
  - Status: Entregue ✅ (parsing no backend + notificação via feature flag)
- Feature 1.3: Anexos em Tarefas
  - História: Como membro, quero anexar arquivos à tarefa.
  - Critérios de aceite: Upload/download; limite de tamanho; tipos permitidos
  - Status: Entregue ✅ (upload multipart, download, delete; UI no modal)

## Épico 2: Estrutura de Trabalho (Subtarefas e Dependências)

- Feature 2.1: Subtarefas
  - História: Como membro, quero dividir tarefas em subtarefas com checklists.
  - Critérios de aceite: parent-child; progresso agregado
  - Status: Entregue ✅ (progresso agregado nas tarefas)
- Feature 2.2: Dependências
  - História: Como PM, quero marcar dependências entre tarefas para visualizar bloqueios.
  - Critérios de aceite: bloqueia/é bloqueada por; prevenção de loops simples
  - Status: Entregue ✅ (validação de ciclos e visual na timeline)

## Épico 3: Marcos e Cronograma do Projeto

- Feature 3.1: Marcos (Milestones)
  - História: Como PM, quero registrar marcos com data e responsável.
  - Critérios de aceite: CRUD de marcos; lembretes próximos ao prazo
  - Status: Entregue ✅ (lembretes + notificação feature-flag)
- Feature 3.2: Cronograma básico
  - História: Como PM, quero timeline de tarefas e marcos.
  - Critérios de aceite: Visualização por projeto; hoje como marcador
  - Status: Parcial ✅ (timeline de tarefas; marcos listados; melhorias futuras)

## Épico 4: Automação e SLA

- Feature 4.1: SLA por tipo/estado
  - História: Como gestor, quero SLAs com lembretes automáticos.
  - Critérios de aceite: tempo em status; lembrete X horas antes do vencimento
  - Status: Entregue ✅ (tempo por status com histórico; lembretes futuros)
- Feature 4.2: Regras de automação
  - História: Como gestor, quero regras (se/então) para automatizar ações.
  - Critérios de aceite: catálogo simples de gatilhos e ações
  - Status: Pendente ⏳

## Épico 5: Portfólio e Governança

- Feature 5.1: Fases/Stage-Gate
  - História: Como PMO, quero aprovações por estágio.
  - Critérios de aceite: estados de projeto; fluxo de aprovação
- Feature 5.2: Riscos e Issues Log
  - História: Como PM, quero gerir riscos e issues.
  - Critérios de aceite: probabilidade, impacto, dono e plano
- Feature 5.3: Papéis e Permissões
  - História: Como admin, quero controlar acesso por papéis/grupos.
  - Critérios de aceite: RBAC por projeto e recurso

## Épico 6: Relatórios e Dashboards

- Feature 6.1: KPIs Operacionais
  - História: Como líder, quero ver lead time, cycle time, WIP.
  - Critérios de aceite: métricas por projeto/time
  - Status: Entregue ✅ (dashboard operacional)
- Feature 6.2: Dashboard Executivo com RAG
  - História: Como diretor, quero ver saúde do portfólio (RAG) e prazos.
  - Critérios de aceite: filtros por área/quarter
  - Status: Entregue ✅ (RAG por projeto; filtros por área/quarter como evolução)

## Épico 7: Integrações e Adoção

- Feature 7.1: Integração Slack/Teams
  - História: Como membro, quero receber notificações e criar tarefas via chat.
  - Status: Pendente ⏳ (notification service preparado; canais futuros)
- Feature 7.2: Calendário (Google/Microsoft)
  - História: Como membro, quero sincronizar prazos e marcos.
  - Status: Pendente ⏳
- Feature 7.3: SSO (Azure AD/Google)
  - História: Como admin, quero autenticação centralizada.
  - Status: Pendente ⏳

---

## Priorização inicial (MVP+)

1) Épico 1 (Comentários; depois menções e anexos)
2) Épico 2 (Subtarefas; Dependências)
3) Épico 3 (Marcos; Timeline)
4) Épico 4.1 (SLA simples)

## Sprint 1 (proposta)

- Backend: Comentários em tarefas (GET/POST)
- Frontend: UI de comentários com @menções (placeholder) e lista com auto-refresh
- Docs: API de comentários e fluxo de uso

## Sprint 2 (proposta)

- Subtarefas (modelo e UI)
- Dependências (modelo mínimo e visualização em timeline)

## Notas

- Estimar histórias (pontos) após detalhamento técnico
- Adotar React Query no front e paginação/filtragem no back ao implementar features
