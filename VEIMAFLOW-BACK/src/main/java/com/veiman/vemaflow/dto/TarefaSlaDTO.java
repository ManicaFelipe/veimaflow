package com.veiman.vemaflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class TarefaSlaDTO {
    private Long tarefaId;
    private String tituloTarefa;
    private String statusAtual;
    private Long tempoTotalSegundos;
    private String tempoTotalFormatado;
    private List<SlaStatusDTO> temposPorStatus;

    public TarefaSlaDTO(Long tarefaId, String tituloTarefa, String statusAtual, Long tempoTotalSegundos, List<SlaStatusDTO> temposPorStatus) {
        this.tarefaId = tarefaId;
        this.tituloTarefa = tituloTarefa;
        this.statusAtual = statusAtual;
        this.tempoTotalSegundos = tempoTotalSegundos;
        this.tempoTotalFormatado = formatarTempo(tempoTotalSegundos);
        this.temposPorStatus = temposPorStatus;
    }

    private String formatarTempo(Long segundos) {
        if (segundos == null || segundos == 0) return "0s";
        
        long dias = segundos / 86400;
        long horas = (segundos % 86400) / 3600;
        long minutos = (segundos % 3600) / 60;
        
        StringBuilder sb = new StringBuilder();
        if (dias > 0) sb.append(dias).append("d ");
        if (horas > 0) sb.append(horas).append("h ");
        if (minutos > 0) sb.append(minutos).append("m");
        
        return sb.toString().trim();
    }
}
