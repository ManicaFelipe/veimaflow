package com.veiman.vemaflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardExecutivoItemDTO {
    private Long projetoId;
    private String projetoNome;
    private long totalTarefas;
    private long tarefasPendentes;
    private long tarefasEmAndamento;
    private long tarefasConcluidas;
    private long tarefasVencidas;
    private String rag; // R | A | G
}
