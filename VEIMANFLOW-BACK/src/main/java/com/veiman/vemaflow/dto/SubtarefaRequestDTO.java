package com.veiman.vemaflow.dto;

public class SubtarefaRequestDTO {
    private String titulo;
    private String status; // opcional, enum em string
    private Integer ordem;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getOrdem() { return ordem; }
    public void setOrdem(Integer ordem) { this.ordem = ordem; }
}
