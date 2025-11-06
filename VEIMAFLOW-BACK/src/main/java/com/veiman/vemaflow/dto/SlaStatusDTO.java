package com.veiman.vemaflow.dto;

import lombok.Data;

@Data
public class SlaStatusDTO {
    private String status;
    private Long tempoSegundos;
    private String tempoFormatado; // "2d 5h 30m"

    public SlaStatusDTO(String status, Long tempoSegundos) {
        this.status = status;
        this.tempoSegundos = tempoSegundos;
        this.tempoFormatado = formatarTempo(tempoSegundos);
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
