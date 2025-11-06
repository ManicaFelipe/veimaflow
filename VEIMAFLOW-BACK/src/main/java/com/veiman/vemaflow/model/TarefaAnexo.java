package com.veiman.vemaflow.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "tarefa_anexos")
@Data
public class TarefaAnexo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarefa_id", nullable = false)
    private Tarefa tarefa;

    @Column(nullable = false)
    private String nomeArquivo;

    private String contentType;

    private Long tamanho;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] dados;

    private LocalDateTime criadoEm = LocalDateTime.now();
}
