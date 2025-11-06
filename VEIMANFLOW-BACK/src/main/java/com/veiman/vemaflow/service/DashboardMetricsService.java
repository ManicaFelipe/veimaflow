package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.DashboardDTO;
import com.veiman.vemaflow.enums.StatusTarefa;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.model.TarefaHistoricoStatus;
import com.veiman.vemaflow.repository.TarefaHistoricoStatusRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardMetricsService {

    private final TarefaRepository tarefaRepository;
    private final TarefaHistoricoStatusRepository historicoRepository;

    public DashboardMetricsService(TarefaRepository tarefaRepository, TarefaHistoricoStatusRepository historicoRepository) {
        this.tarefaRepository = tarefaRepository;
        this.historicoRepository = historicoRepository;
    }

    @Transactional(readOnly = true)
    public DashboardDTO calcularMetricas(Long projetoId) {
        DashboardDTO dashboard = new DashboardDTO();

        List<Tarefa> tarefas;
        if (projetoId != null) {
            tarefas = tarefaRepository.findByProjetoId(projetoId);
        } else {
            tarefas = tarefaRepository.findAll();
        }

        dashboard.setTotalTarefas((long) tarefas.size());

        // Contadores por status
        long pendentes = tarefas.stream().filter(t -> StatusTarefa.NAO_INICIADO.equals(t.getStatus())).count();
        long emAndamento = tarefas.stream().filter(t -> StatusTarefa.EM_ANDAMENTO.equals(t.getStatus())).count();
        long concluidas = tarefas.stream().filter(t -> StatusTarefa.CONCLUIDA.equals(t.getStatus())).count();

        dashboard.setTarefasPendentes(pendentes);
        dashboard.setTarefasEmAndamento(emAndamento);
        dashboard.setTarefasConcluidas(concluidas);
        dashboard.setWip(emAndamento); // WIP = tarefas em andamento

        // Tarefas vencidas (dataFim < hoje e status != CONCLUIDA)
        LocalDate hoje = LocalDate.now();
        long vencidas = tarefas.stream()
                .filter(t -> t.getDataFim() != null && t.getDataFim().isBefore(hoje) && !StatusTarefa.CONCLUIDA.equals(t.getStatus()))
                .count();
        dashboard.setTarefasVencidas(vencidas);

        // Lead time médio (criação → conclusão) para tarefas concluídas
        List<Tarefa> tarefasConcluidas = tarefas.stream()
                .filter(t -> StatusTarefa.CONCLUIDA.equals(t.getStatus()) && t.getDataCriacao() != null)
                .toList();

        if (!tarefasConcluidas.isEmpty()) {
            double somaLeadTime = 0.0;
            for (Tarefa t : tarefasConcluidas) {
                LocalDateTime criacao = t.getDataCriacao().atStartOfDay();
                LocalDateTime conclusao = obterDataConclusao(t).orElse(LocalDateTime.now());
                long dias = Duration.between(criacao, conclusao).toDays();
                somaLeadTime += dias;
            }
            dashboard.setLeadTimeMediaDias(somaLeadTime / tarefasConcluidas.size());
        }

        // Cycle time médio (Em andamento → Concluída) para tarefas concluídas
        if (!tarefasConcluidas.isEmpty()) {
            double somaCycleTime = 0.0;
            int contador = 0;
            for (Tarefa t : tarefasConcluidas) {
                Optional<LocalDateTime> inicioAndamento = obterDataInicioAndamento(t);
                Optional<LocalDateTime> conclusao = obterDataConclusao(t);
                if (inicioAndamento.isPresent() && conclusao.isPresent()) {
                    long dias = Duration.between(inicioAndamento.get(), conclusao.get()).toDays();
                    somaCycleTime += dias;
                    contador++;
                }
            }
            if (contador > 0) {
                dashboard.setCycleTimeMediaDias(somaCycleTime / contador);
            }
        }

        return dashboard;
    }

    private Optional<LocalDateTime> obterDataInicioAndamento(Tarefa tarefa) {
        List<TarefaHistoricoStatus> historico = historicoRepository.findByTarefaIdOrderByDataHoraMudancaAsc(tarefa.getId());
        return historico.stream()
                .filter(h -> "EM_ANDAMENTO".equals(h.getStatusNovo()))
                .map(TarefaHistoricoStatus::getDataHoraMudanca)
                .findFirst();
    }

    private Optional<LocalDateTime> obterDataConclusao(Tarefa tarefa) {
        List<TarefaHistoricoStatus> historico = historicoRepository.findByTarefaIdOrderByDataHoraMudancaAsc(tarefa.getId());
        return historico.stream()
                .filter(h -> "CONCLUIDA".equals(h.getStatusNovo()))
                .map(TarefaHistoricoStatus::getDataHoraMudanca)
                .findFirst();
    }
}
