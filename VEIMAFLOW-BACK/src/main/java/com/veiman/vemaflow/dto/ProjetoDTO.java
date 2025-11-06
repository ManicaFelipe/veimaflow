package com.veiman.vemaflow.dto;

import java.time.LocalDate;
import java.util.List;

public class ProjetoDTO {
    private Long id;
    private String uuid;
    private String nome;
    private String descricao;
    private String status;
    private List<String> timesResponsaveis;
    private LocalDate dataInicio;
    private LocalDate dataFim;

    public ProjetoDTO() {}

    public ProjetoDTO(Long id, String uuid, String nome, String descricao, String status,
                      List<String> timesResponsaveis, LocalDate dataInicio, LocalDate dataFim) {
        this.id = id;
        this.uuid = uuid;
        this.nome = nome;
        this.descricao = descricao;
        this.status = status;
        this.timesResponsaveis = timesResponsaveis;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUuid() { return uuid; }
    public void setUuid(String uuid) { this.uuid = uuid; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getTimesResponsaveis() { return timesResponsaveis; }
    public void setTimesResponsaveis(List<String> timesResponsaveis) { this.timesResponsaveis = timesResponsaveis; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
}
