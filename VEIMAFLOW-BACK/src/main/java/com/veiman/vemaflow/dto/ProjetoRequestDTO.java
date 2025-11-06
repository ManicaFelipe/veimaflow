package com.veiman.vemaflow.dto;

import java.time.LocalDate;
import java.util.List;

public class ProjetoRequestDTO {
    private String nome;
    private String descricao;
        private String status;
    private List<Long> timesResponsaveisIds;
    private LocalDate dataInicio;
    private LocalDate dataFim;

    // Getters e Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

    public List<Long> getTimesResponsaveisIds() { return timesResponsaveisIds; }
    public void setTimesResponsaveisIds(List<Long> timesResponsaveisIds) { this.timesResponsaveisIds = timesResponsaveisIds; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
}
