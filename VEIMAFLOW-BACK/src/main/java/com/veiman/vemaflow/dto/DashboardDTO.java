package com.veiman.vemaflow.dto;

import lombok.Data;

@Data
public class DashboardDTO {
    private Long totalTarefas;
    private Long tarefasPendentes;
    private Long tarefasEmAndamento;
    private Long tarefasConcluidas;
    private Long tarefasVencidas;
    private Double leadTimeMediaDias;
    private Double cycleTimeMediaDias;
    private Long wip; // Work In Progress

    public DashboardDTO() {
        this.totalTarefas = 0L;
        this.tarefasPendentes = 0L;
        this.tarefasEmAndamento = 0L;
        this.tarefasConcluidas = 0L;
        this.tarefasVencidas = 0L;
        this.leadTimeMediaDias = 0.0;
        this.cycleTimeMediaDias = 0.0;
        this.wip = 0L;
    }
}
