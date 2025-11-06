package com.veiman.vemaflow.model;

import com.veiman.vemaflow.enums.StatusTarefa;
import jakarta.persistence.*;

@Entity
@Table(name = "subtarefas")
public class Subtarefa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarefa_pai_id", nullable = false)
    private Tarefa tarefaPai;

    @Column(nullable = false)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusTarefa status = StatusTarefa.NAO_INICIADO;

    @Column
    private Integer ordem;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tarefa getTarefaPai() { return tarefaPai; }
    public void setTarefaPai(Tarefa tarefaPai) { this.tarefaPai = tarefaPai; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public StatusTarefa getStatus() { return status; }
    public void setStatus(StatusTarefa status) { this.status = status; }

    public Integer getOrdem() { return ordem; }
    public void setOrdem(Integer ordem) { this.ordem = ordem; }
}
