# Roadmap do Produto

Este roadmap prioriza entregas por trimestre e por sprints, alinhado aos épicos do BACKLOG.md.

## Q1

- Comentários em tarefas (CRUD mínimo: GET/POST) + UI básica
- Subtarefas (parent-child) com progresso agregado
- Dependências entre tarefas (bloqueia/é bloqueada por) + visual na timeline
- Marcos do projeto e lembretes

## Q2

- Workflows customizáveis por projeto (estados/transições/campos obrigatórios)
- SLA simples por tipo/estado e lembretes automáticos
- Dashboard operacional: lead time, cycle time, WIP, tarefas vencidas
- Integração Slack/Teams (notificações + criar tarefa via chat)

## Q3

- Portfólio com iniciativas e OKRs
- Stage-gate (aprovação por fase)
- Riscos e Issues log com matrizes
- Integração Calendário (Google/Microsoft) para prazos/marcos

## Q4

- Relatório executivo com RAG por área/quarter
- Custos (estimado vs realizado) e baseline
- SSO (Azure AD/Google)
- Observabilidade e auditoria enterprise

---

## Sprints iniciais (2 semanas cada)

### Sprint 1

- Backend: Comentários (GET/POST) — entregue no código base
- Frontend: UI de comentários nas tarefas (listar/criar, menções na cópia do texto)
- Docs: OpenAPI (comentários) — entregue em `vemaflow/api/openapi.yaml`

### Sprint 2

- Subtarefas: modelo + endpoints + UI
- Timeline: exibir subtarefas e dependências

### Sprint 3

- Dependências: endpoints e validações de ciclo
- Lembretes para marcos próximos (notificação básica)

### Sprint 4

- SLA simples (tempo em status) e lembretes
- Dashboard operacional
