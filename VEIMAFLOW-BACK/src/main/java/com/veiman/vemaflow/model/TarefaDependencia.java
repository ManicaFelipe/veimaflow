package com.veiman.vemaflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tarefa_dependencias", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"origem_id", "destino_id"})
})
public class TarefaDependencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origem_id", nullable = false)
    private Tarefa origem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destino_id", nullable = false)
    private Tarefa destino;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tarefa getOrigem() { return origem; }
    public void setOrigem(Tarefa origem) { this.origem = origem; }

    public Tarefa getDestino() { return destino; }
    public void setDestino(Tarefa destino) { this.destino = destino; }
}
