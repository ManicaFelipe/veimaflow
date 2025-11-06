package com.veiman.vemaflow.dto;

import com.veiman.vemaflow.enums.StatusTarefa;

public class SubtarefaDTO {
    private Long id;
    private Long tarefaId;
    private String titulo;
    private StatusTarefa status;
    private Integer ordem;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTarefaId() { return tarefaId; }
    public void setTarefaId(Long tarefaId) { this.tarefaId = tarefaId; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public StatusTarefa getStatus() { return status; }
    public void setStatus(StatusTarefa status) { this.status = status; }
    public Integer getOrdem() { return ordem; }
    public void setOrdem(Integer ordem) { this.ordem = ordem; }
}
