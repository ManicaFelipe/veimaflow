package com.veiman.vemaflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TarefaAnexoDTO {
    private Long id;
    private String nomeArquivo;
    private String contentType;
    private Long tamanho;
    private LocalDateTime criadoEm;
    private Long tarefaId;
}
