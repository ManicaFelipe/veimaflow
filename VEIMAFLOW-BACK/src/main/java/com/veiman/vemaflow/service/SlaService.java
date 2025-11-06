package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.SlaStatusDTO;
import com.veiman.vemaflow.dto.TarefaSlaDTO;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.model.TarefaHistoricoStatus;
import com.veiman.vemaflow.repository.TarefaHistoricoStatusRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SlaService {

    private final TarefaRepository tarefaRepository;
    private final TarefaHistoricoStatusRepository historicoRepository;

    public SlaService(TarefaRepository tarefaRepository, TarefaHistoricoStatusRepository historicoRepository) {
        this.tarefaRepository = tarefaRepository;
        this.historicoRepository = historicoRepository;
    }

    @Transactional(readOnly = true)
    public TarefaSlaDTO calcularSla(Long tarefaId) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new IllegalArgumentException("Tarefa não encontrada com ID: " + tarefaId));

        List<TarefaHistoricoStatus> historico = historicoRepository.findByTarefaIdOrderByDataHoraMudancaAsc(tarefaId);

        // Mapa para acumular tempo por status
        Map<String, Long> tempoPorStatus = new HashMap<>();

        if (historico.isEmpty()) {
            // Sem histórico, calcular desde criação até agora no status atual
            LocalDateTime criacao = tarefa.getDataCriacao() != null 
                ? tarefa.getDataCriacao().atStartOfDay() 
                : LocalDateTime.now().minusDays(1);
            long segundos = Duration.between(criacao, LocalDateTime.now()).getSeconds();
            String statusAtual = tarefa.getStatus() != null ? tarefa.getStatus().name() : "NAO_INICIADO";
            tempoPorStatus.put(statusAtual, segundos);
        } else {
            // Processar histórico
            LocalDateTime inicio = tarefa.getDataCriacao() != null 
                ? tarefa.getDataCriacao().atStartOfDay() 
                : historico.get(0).getDataHoraMudanca();

            for (int i = 0; i < historico.size(); i++) {
                TarefaHistoricoStatus h = historico.get(i);
                LocalDateTime fim = h.getDataHoraMudanca();
                String status = h.getStatusAnterior() != null ? h.getStatusAnterior() : "NAO_INICIADO";
                
                long segundos = Duration.between(inicio, fim).getSeconds();
                tempoPorStatus.merge(status, segundos, Long::sum);
                
                inicio = fim;
            }

            // Tempo no status atual (desde última mudança até agora)
            String statusAtual = tarefa.getStatus() != null ? tarefa.getStatus().name() : "NAO_INICIADO";
            long segundosAtual = Duration.between(inicio, LocalDateTime.now()).getSeconds();
            tempoPorStatus.merge(statusAtual, segundosAtual, Long::sum);
        }

        // Converter para DTOs
        List<SlaStatusDTO> slaList = tempoPorStatus.entrySet().stream()
                .map(e -> new SlaStatusDTO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(SlaStatusDTO::getTempoSegundos).reversed())
                .collect(Collectors.toList());

        long tempoTotal = tempoPorStatus.values().stream().mapToLong(Long::longValue).sum();

    return new TarefaSlaDTO(
        tarefa.getId(),
        tarefa.getTitulo(),
        tarefa.getStatus() != null ? tarefa.getStatus().name() : null,
        tempoTotal,
        slaList
    );
    }

    /**
     * Registra mudança de status para cálculo de SLA
     */
    @Transactional
    public void registrarMudancaStatus(Tarefa tarefa, String statusAnterior, String statusNovo, String usuario) {
        if (statusAnterior == null || statusAnterior.equals(statusNovo)) {
            return; // Não registra se status não mudou
        }

        TarefaHistoricoStatus historico = new TarefaHistoricoStatus(tarefa, statusAnterior, statusNovo, usuario);
        historicoRepository.save(historico);
    }
}
