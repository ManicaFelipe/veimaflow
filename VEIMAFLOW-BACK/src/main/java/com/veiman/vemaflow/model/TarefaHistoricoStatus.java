package com.veiman.vemaflow.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tarefa_historico_status")
@Data
public class TarefaHistoricoStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarefa_id", nullable = false)
    private Tarefa tarefa;

    @Column(nullable = false, length = 50)
    private String statusAnterior;

    @Column(nullable = false, length = 50)
    private String statusNovo;

    @Column(nullable = false)
    private LocalDateTime dataHoraMudanca;

    @Column(length = 100)
    private String usuarioAlteracao;

    public TarefaHistoricoStatus() {
        this.dataHoraMudanca = LocalDateTime.now();
    }

    public TarefaHistoricoStatus(Tarefa tarefa, String statusAnterior, String statusNovo, String usuarioAlteracao) {
        this.tarefa = tarefa;
        this.statusAnterior = statusAnterior;
        this.statusNovo = statusNovo;
        this.usuarioAlteracao = usuarioAlteracao;
        this.dataHoraMudanca = LocalDateTime.now();
    }
}
