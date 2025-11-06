package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.DashboardExecutivoItemDTO;
import com.veiman.vemaflow.enums.StatusTarefa;
import com.veiman.vemaflow.model.Projeto;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.repository.ProjetoRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardExecutivoService {

    private final ProjetoRepository projetoRepository;
    private final TarefaRepository tarefaRepository;

    public List<DashboardExecutivoItemDTO> obterResumoRAG() {
        List<Projeto> projetos = projetoRepository.findAll();
        List<DashboardExecutivoItemDTO> items = new ArrayList<>();

        for (Projeto p : projetos) {
            List<Tarefa> tarefas = tarefaRepository.findByProjetoId(p.getId());
            long total = tarefas.size();
            long pendentes = tarefas.stream().filter(t -> t.getStatus() == StatusTarefa.NAO_INICIADO).count();
            long andamento = tarefas.stream().filter(t -> t.getStatus() == StatusTarefa.EM_ANDAMENTO).count();
            long concluidas = tarefas.stream().filter(t -> t.getStatus() == StatusTarefa.CONCLUIDA).count();
            long vencidas = tarefas.stream().filter(t -> {
                // heurística simples: se dataFim existe e já passou e não está concluída -> vencida
                java.time.LocalDate fim = t.getDataFim();
                return fim != null && fim.isBefore(java.time.LocalDate.now()) && t.getStatus() != StatusTarefa.CONCLUIDA && t.getStatus() != StatusTarefa.CANCELADA;
            }).count();

            String rag = calcularRag(total, pendentes, andamento, vencidas);

            items.add(DashboardExecutivoItemDTO.builder()
                    .projetoId(p.getId())
                    .projetoNome(p.getNome())
                    .totalTarefas(total)
                    .tarefasPendentes(pendentes)
                    .tarefasEmAndamento(andamento)
                    .tarefasConcluidas(concluidas)
                    .tarefasVencidas(vencidas)
                    .rag(rag)
                    .build());
        }

        return items;
    }

    private String calcularRag(long total, long pendentes, long andamento, long vencidas) {
        if (total <= 0) return "G";
        double wipRatio = andamento / (double) total;

        if (vencidas > 0 || wipRatio > 0.6) return "R";
        if (wipRatio > 0.3 || pendentes > 0) return "A";
        return "G";
    }
}
