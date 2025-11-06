package com.veiman.vemaflow.dto;

import java.time.LocalDate;

public class MarcoDTO {
    private Long id;
    private Long projetoId;
    private String titulo;
    private LocalDate data;
    private String responsavelNome;
    private Integer lembreteDiasAntes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProjetoId() { return projetoId; }
    public void setProjetoId(Long projetoId) { this.projetoId = projetoId; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public String getResponsavelNome() { return responsavelNome; }
    public void setResponsavelNome(String responsavelNome) { this.responsavelNome = responsavelNome; }
    public Integer getLembreteDiasAntes() { return lembreteDiasAntes; }
    public void setLembreteDiasAntes(Integer lembreteDiasAntes) { this.lembreteDiasAntes = lembreteDiasAntes; }
}
