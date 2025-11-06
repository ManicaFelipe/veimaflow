package com.veiman.vemaflow.service;

import com.veiman.vemaflow.enums.StatusTarefa;
import com.veiman.vemaflow.enums.PrioridadeTarefa;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.repository.TarefaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TarefaRepository tarefaRepository;

    public DashboardService(TarefaRepository tarefaRepository) {
        this.tarefaRepository = tarefaRepository;
    }

    public Map<String, Object> gerarResumo() {
        List<Tarefa> tarefas = tarefaRepository.findAll();
        Map<String, Object> dashboard = new LinkedHashMap<>();

        dashboard.put("totalTarefas", tarefas.size());

        dashboard.put("porStatus", tarefas.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting())));

        dashboard.put("porPrioridade", tarefas.stream()
                .collect(Collectors.groupingBy(t -> t.getPrioridade().name(), Collectors.counting())));

        dashboard.put("porUsuario", tarefas.stream()
                .collect(Collectors.groupingBy(Tarefa::getNomeUsuario, Collectors.counting())));

        dashboard.put("porTime", tarefas.stream()
                .collect(Collectors.groupingBy(Tarefa::getTimeUsuario, Collectors.counting())));

        dashboard.put("porProjeto", tarefas.stream()
                .collect(Collectors.groupingBy(Tarefa::getProjetoId, Collectors.counting())));

        dashboard.put("atrasadas", tarefas.stream()
                .filter(t -> t.getDataFim() != null &&
                        t.getDataFim().isBefore(LocalDate.now()) &&
                        t.getStatus() != StatusTarefa.CONCLUIDA)
                .count());

        return dashboard;
    }
}
