# Plano Único do Produto

Este arquivo consolida Roadmap, Backlog e Plano de Sprints em um único documento para referência e execução.

---

## Roadmap do Produto (consolidado de ROADMAP.md)

Este roadmap prioriza entregas por trimestre e por sprints, alinhado aos épicos do BACKLOG.md.

### Q1

- Comentários em tarefas (CRUD mínimo: GET/POST) + UI básica
- Subtarefas (parent-child) com progresso agregado
- Dependências entre tarefas (bloqueia/é bloqueada por) + visual na timeline
- Marcos do projeto e lembretes
- SLA simples por tipo/estado (tempo em status)
- Dashboard operacional: lead time, cycle time, WIP, tarefas vencidas
- Dashboard executivo (RAG) por projeto (adiantado)

### Q2

- Workflows customizáveis por projeto (estados/transições/campos obrigatórios)
- Integração Slack/Teams (notificações + criar tarefa via chat)

### Q3

- Portfólio com iniciativas e OKRs
- Stage-gate (aprovação por fase)
- Riscos e Issues log com matrizes
- Integração Calendário (Google/Microsoft) para prazos/marcos

### Q4

- Relatório executivo com RAG por área/quarter (base entregue; expandir filtros e cortes por período)
- Custos (estimado vs realizado) e baseline
- SSO (Azure AD/Google)
- Observabilidade e auditoria enterprise

---

## Backlog de Produto (consolidado de BACKLOG.md)

Este backlog organiza as melhorias de negócio sugeridas em épicos, com features e histórias, prioridades e critérios de aceite resumidos. Use este arquivo como referência para planejamento de sprints.

### Épico 1: Colaboração em Tarefas (Comentários, Menções e Anexos)

- Feature 1.1: Comentários em Tarefas
  - História: Como membro do time, quero comentar em uma tarefa para registrar decisões e dúvidas.
  - Critérios de aceite:
    - GET/POST /api/tarefas/{id}/comentarios
    - Comentários ordenados por data (asc)
    - Registro de autor e data
- Feature 1.2: Menções (@usuario)
  - História: Como membro, quero mencionar alguém para notificá-lo.
  - Critérios de aceite: Parsing de @nome; notificação gerada
- Feature 1.3: Anexos em Tarefas
  - História: Como membro, quero anexar arquivos à tarefa.
  - Critérios de aceite: Upload/download; limite de tamanho; tipos permitidos

### Épico 2: Estrutura de Trabalho (Subtarefas e Dependências)

- Feature 2.1: Subtarefas
  - História: Como membro, quero dividir tarefas em subtarefas com checklists.
  - Critérios de aceite: parent-child; progresso agregado
- Feature 2.2: Dependências
  - História: Como PM, quero marcar dependências entre tarefas para visualizar bloqueios.
  - Critérios de aceite: bloqueia/é bloqueada por; prevenção de loops simples

### Épico 3: Marcos e Cronograma do Projeto

- Feature 3.1: Marcos (Milestones)
  - História: Como PM, quero registrar marcos com data e responsável.
  - Critérios de aceite: CRUD de marcos; lembretes próximos ao prazo
- Feature 3.2: Cronograma básico
  - História: Como PM, quero timeline de tarefas e marcos.
  - Critérios de aceite: Visualização por projeto; hoje como marcador

### Épico 4: Automação e SLA

- Feature 4.1: SLA por tipo/estado
  - História: Como gestor, quero SLAs com lembretes automáticos.
  - Critérios de aceite: tempo em status; lembrete X horas antes do vencimento
- Feature 4.2: Regras de automação
  - História: Como gestor, quero regras (se/então) para automatizar ações.
  - Critérios de aceite: catálogo simples de gatilhos e ações

### Épico 5: Portfólio e Governança

- Feature 5.1: Fases/Stage-Gate
  - História: Como PMO, quero aprovações por estágio.
  - Critérios de aceite: estados de projeto; fluxo de aprovação
- Feature 5.2: Riscos e Issues Log
  - História: Como PM, quero gerir riscos e issues.
  - Critérios de aceite: probabilidade, impacto, dono e plano
- Feature 5.3: Papéis e Permissões
  - História: Como admin, quero controlar acesso por papéis/grupos.
  - Critérios de aceite: RBAC por projeto e recurso

### Épico 6: Relatórios e Dashboards

- Feature 6.1: KPIs Operacionais
  - História: Como líder, quero ver lead time, cycle time, WIP.
  - Critérios de aceite: métricas por projeto/time
- Feature 6.2: Dashboard Executivo com RAG
  - História: Como diretor, quero ver saúde do portfólio (RAG) e prazos.
  - Critérios de aceite: filtros por área/quarter

### Épico 7: Integrações e Adoção

- Feature 7.1: Integração Slack/Teams
  - História: Como membro, quero receber notificações e criar tarefas via chat.
- Feature 7.2: Calendário (Google/Microsoft)
  - História: Como membro, quero sincronizar prazos e marcos.
- Feature 7.3: SSO (Azure AD/Google)
  - História: Como admin, quero autenticação centralizada.

---

## Plano de Sprints (consolidado de SPRINT_PLAN.md)

Estimativas em pontos (1, 2, 3, 5, 8, 13) e dependências entre tarefas.

### Sprint 1 (2 semanas)

- Comentários em tarefas (Backend) — 3 pts — FE depende da API
  - Listar comentários (GET /api/tarefas/{id}/comentarios)
  - Criar comentário (POST /api/tarefas/{id}/comentarios)
- UI de comentários nas tarefas — 5 pts
  - Lista com auto-refresh (após POST)
  - Form de comentário; mencionar @usuario (texto simples)
- Documentação OpenAPI (comentários) — 1 pt
  - `vemaflow/api/openapi.yaml` atualizado

### Sprint 2 (2 semanas)

- Subtarefas (modelo + API + UI) — 8 pts
  - Entidade Subtarefa: id, tarefaPaiId, titulo, status, ordem
  - GET/POST/PUT/DELETE /api/tarefas/{id}/subtarefas
  - Progresso agregado na tarefa
- Timeline: exibir subtarefas e dependências — 5 pts
  - Agrupar por projeto e exibir faixas por período

### Sprint 3 (2 semanas)

- Dependências entre tarefas — 8 pts
  - Modelo: arestas (de -> para); evitar ciclos simples
  - Impacto visual: indicar bloqueios
- Lembretes para marcos próximos — 3 pts
  - Serviço agendado (dev) e notificação simples

### Sprint 4 (2 semanas) — Entregue ✅

- SLA simples (tempo em status) — 5 pts
  - Capturar mudanças de status e somar tempo por estado
- Dashboard operacional — 5 pts
  - KPIs básicos: lead/cycle, WIP, tarefas vencidas
- Dashboard executivo (RAG) — 3 pts (adiantado)

### Riscos e mitigação

- Autenticação/Autorização para comentários e novas rotas
  - Mitigar: reusar JWT atual e permissões por papel (em etapa posterior)
- Volume de dados em timeline
  - Mitigar: paginação/virtualização e filtros por período

### Definição de pronto (DoD)

- Código revisado e testado (unit/integration)
- OpenAPI/documentação atualizada
- Sem regressões no fluxo atual (Projetos/Tarefas)
- Lint/format ok; build verde

---

## Estado atual e pendências

- Q1 entregue; Sprints 1–4 concluídas.
- Pendências principais: Workflows customizáveis, integrações (Slack/Teams, Calendário), RBAC/SSO, relatórios avançados e cortes executivos, otimizações de performance e qualidade (paginações/caching, builds verdes, lints).
